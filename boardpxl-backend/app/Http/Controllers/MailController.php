<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\MailService;
use Illuminate\Support\Facades\Mail;

class MailController extends Controller
{
    /**
     * Envoi de mail via MailService
     */
    public function sendEmail(Request $request, MailService $mailService)
    {
        $validated = $request->validate([
            'to' => 'required|email',
            'from' => 'required|email',
            'subject' => 'required|string|max:255',
            'body' => 'required|string|max:10000',
        ]);

        try {
            $mailService->sendEmail(
                $validated['to'],
                $validated['from'],
                $validated['subject'],
                $validated['body']
            );

            return response()->json([
                'success' => true,
                'message' => 'Email sent successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test d’envoi mail simple
     */
    public function testMail()
    {
        Mail::raw('Test Mailpit depuis Docker', function ($message) {
            $message->to('test@example.com')
                    ->subject('Hello from Mailpit');
        });

        if (Mail::failures()) {
            return response()->json(['message' => 'Échec de l\'envoi du mail.'], 500);
        }

        return response()->json(['message' => 'Mail envoyé (si tout va bien) !']);
    }
}
