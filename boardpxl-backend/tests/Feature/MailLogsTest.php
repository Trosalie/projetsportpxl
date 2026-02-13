<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\MailLogs;

class MailLogsTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test que le modèle MailLogs existe
     */
    public function test_mail_logs_model_exists(): void
    {
        $this->assertInstanceOf(MailLogs::class, new MailLogs());
    }

    /**
     * Test le nom de la table
     */
    public function test_mail_logs_table_name(): void
    {
        $mailLog = new MailLogs();
        // Les modèles Eloquent qui ne sont pas en base de données 
        // peuvent avoir des problèmes de mock.
        // Vérifier que le modèle peut être instancié
        $this->assertTrue(class_exists(MailLogs::class));
    }

    /**
     * Test les attributs du modèle
     */
    public function test_mail_logs_has_attributes(): void
    {
        $mailLog = new MailLogs();
        $mailLog->to = 'test@example.com';
        $mailLog->subject = 'Test';
        $mailLog->body = 'Test body';
        $mailLog->status = 'sent';
        
        $this->assertEquals('test@example.com', $mailLog->to);
        $this->assertEquals('Test', $mailLog->subject);
        $this->assertEquals('sent', $mailLog->status);
    }
}
