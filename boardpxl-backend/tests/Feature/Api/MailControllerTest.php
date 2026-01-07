<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use App\Services\MailService;
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

        $response = $this->postJson('/api/send-email', [
            'to' => 'test@example.com',
            'from' => 'noreply@example.com',
            'subject' => 'Test Subject',
            'body' => 'Test Body'
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
}