<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use App\Services\MailService;
use App\Models\MailLogs;
use Tests\TestCase;
use Mockery;
use Illuminate\Support\Facades\Mail;

class MailControllerTest extends TestCase
{
    use WithoutMiddleware;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // Ce test vérifie l'envoi réussi d'un email.
    // Il simule une requête POST avec les détails de l'email et s'attend à une confirmation de succès.
    public function test_send_email_success()
    {
        // Mock du service Mail
        $mock = Mockery::mock(MailService::class);
        $mock->shouldReceive('sendEmail')
            ->once()
            ->andReturn(true);

        $this->app->instance(MailService::class, $mock);

        // Mock MailLogs pour éviter l'accès à la base de données
        $mailLogsMock = Mockery::mock('alias:' . MailLogs::class);
        $mailLogsMock->shouldReceive('create')
            ->once()
            ->andReturn(true);

        $response = $this->postJson('/api/send-email', [
            'to' => 'test@example.com',
            'from' => 'noreply@example.com',
            'subject' => 'Test Subject',
            'body' => 'Test Body',
            'type' => 'generic'
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Email sent successfully.'
                ]);
    }

    // Ce test vérifie l'envoi d'un email de test.
    // Il simule une requête GET pour déclencher l'envoi d'un email de test et vérifie la réponse.
    public function test_test_mail()
    {
        // Mock de Mail pour éviter l'envoi réel
        Mail::shouldReceive('raw')
            ->once()
            ->andReturnSelf();
        Mail::shouldReceive('failures')
            ->once()
            ->andReturn([]);

        $response = $this->getJson('/api/test-mail');

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Mail envoyé (si tout va bien) !'
                ]);
    }

    /**
     * Test sendEmail catch block when MailService throws exception
     * Tests lines 87-107: catch block that creates failed MailLogs, logs action, and returns 500 error
     */
    public function test_send_email_catches_exception_returns_500()
    {
        // Mock MailService to throw an exception
        $mock = Mockery::mock(MailService::class);
        $exception = new \Exception('SMTP connection failed');
        $mock->shouldReceive('sendEmail')
            ->once()
            ->andThrow($exception);

        $this->app->instance(MailService::class, $mock);

        // Mock MailLogs model to prevent database access
        $mailLogsMock = Mockery::mock('alias:' . MailLogs::class);
        $mailLogsMock->shouldReceive('create')
            ->andReturn(true);

        $response = $this->postJson('/api/send-email', [
            'to' => 'test@example.com',
            'from' => 'noreply@example.com',
            'subject' => 'Test Subject',
            'body' => 'Test Body',
            'type' => 'generic'
        ]);

        $response->assertStatus(500);
        $response->assertJson([
            'success' => false,
        ]);
        $response->assertJsonFragment([
            'message' => 'Failed to send email: SMTP connection failed'
        ]);
    }

    /**
     * Test sendEmail catch block creates failed response with specific error
     * Verifies that when exception occurs, proper error response is returned with 500 status
     */
    public function test_send_email_exception_returns_error_response()
    {
        // Mock MailService to throw exception
        $mock = Mockery::mock(MailService::class);
        $mock->shouldReceive('sendEmail')
            ->once()
            ->andThrow(new \Exception('Database error'));

        $this->app->instance(MailService::class, $mock);

        // Mock MailLogs
        $mailLogsMock = Mockery::mock('alias:' . MailLogs::class);
        $mailLogsMock->shouldReceive('create')
            ->andReturn(true);

        $response = $this->postJson('/api/send-email', [
            'to' => 'failed@example.com',
            'from' => 'sender@example.com',
            'subject' => 'Failed Email',
            'body' => 'This will fail',
        ]);

        $response->assertStatus(500);
        $response->assertJson([
            'success' => false,
            'message' => 'Failed to send email: Database error'
        ]);
    }

    /**
     * Test sendEmail catch block returns proper error response structure
     * Verifies line 103-106: return response with success=false and error message
     */
    public function test_send_email_catch_returns_error_json_structure()
    {
        $mock = Mockery::mock(MailService::class);
        $customError = 'Custom error message from service';
        $mock->shouldReceive('sendEmail')
            ->once()
            ->andThrow(new \Exception($customError));

        $this->app->instance(MailService::class, $mock);

        // Mock MailLogs
        $mailLogsMock = Mockery::mock('alias:' . MailLogs::class);
        $mailLogsMock->shouldReceive('create')
            ->andReturn(true);

        $response = $this->postJson('/api/send-email', [
            'to' => 'test@test.com',
            'from' => 'from@test.com',
            'subject' => 'Test',
            'body' => 'Testing error catch'
        ]);

        $response->assertStatus(500);
        $data = $response->json();
        
        $this->assertFalse($data['success']);
        $this->assertStringContainsString('Failed to send email:', $data['message']);
        $this->assertStringContainsString($customError, $data['message']);
    }

    /**
     * Test sendEmail exception response includes dynamic error message
     * Verifies line 105: message includes the actual exception message
     */
    public function test_send_email_exception_message_includes_exception_details()
    {
        $mock = Mockery::mock(MailService::class);
        $errorMsg = 'Connection timeout after 30 seconds';
        $mock->shouldReceive('sendEmail')
            ->once()
            ->andThrow(new \Exception($errorMsg));

        $this->app->instance(MailService::class, $mock);

        // Mock MailLogs
        $mailLogsMock = Mockery::mock('alias:' . MailLogs::class);
        $mailLogsMock->shouldReceive('create')
            ->andReturn(true);

        $response = $this->postJson('/api/send-email', [
            'to' => 'user@example.com',
            'from' => 'admin@example.com',
            'subject' => 'Timeout Test',
            'body' => 'Testing timeout error'
        ]);

        $response->assertStatus(500);
        $json = $response->json();
        
        $this->assertEquals('Failed to send email: ' . $errorMsg, $json['message']);
    }
}
