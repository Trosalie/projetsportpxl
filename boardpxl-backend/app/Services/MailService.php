<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MailService
{
    public function sendEmail($to, $from, $subject, $body){
        Mail::raw($body, function ($message) use ($to, $from, $subject) {
            $message->to($to)
                    ->from('noreply@boardpxl.com', 'BoardPXL')
                    ->replyTo($from)
                    ->subject($subject);
        });
    }
}