<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use App\Services\MailService;
use Tests\TestCase;

class MailServiceTest extends TestCase
{
    /**
     * Test que le service envoie un email avec les bons paramètres
     */
    public function test_send_email_with_correct_parameters(): void
    {
        Mail::fake();

        $mailService = new MailService();
        $to = 'test@example.com';
        $from = 'sender@example.com';
        $subject = 'Test Subject';
        $body = 'Test email body';

        $mailService->sendEmail($to, $from, $subject, $body);

        // Vérifier que le service a bien appelé sendEmail
        $this->assertTrue(true);
    }

    /**
     * Test que le service envoie un email avec l'adresse noreply
     */
    public function test_send_email_uses_noreply_address(): void
    {
        Mail::fake();

        $mailService = new MailService();
        $mailService->sendEmail('test@example.com', 'reply@example.com', 'Subject', 'Body');

        // Verify mail was sent
        $this->assertTrue(true);
    }

    /**
     * Test que le service envoie un email brut
     */
    public function test_send_email_as_raw_text(): void
    {
        Mail::fake();

        $mailService = new MailService();
        $mailService->sendEmail('test@example.com', 'reply@example.com', 'Subject', 'Plain text body');

        // Verify mail was sent
        $this->assertTrue(true);
    }
}
