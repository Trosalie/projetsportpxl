<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Logs;
use App\Models\LogActions;
use App\Models\User;

class LogsTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test que le modèle Logs existe
     */
    public function test_logs_model_exists(): void
    {
        $this->assertInstanceOf(Logs::class, new Logs());
    }

    /**
     * Test le nom de la table
     */
    public function test_logs_table_name(): void
    {
        $log = new Logs();
        $this->assertEquals('logs', $log->getTable());
    }

    /**
     * Test les attributs du modèle
     */
    public function test_logs_has_attributes(): void
    {
        $log = new Logs();
        $log->action_id = 1;
        $log->user_id = 1;
        $log->table_name = 'INVOICES';
        $log->ip_address = '192.168.1.1';
        
        $this->assertEquals(1, $log->action_id);
        $this->assertEquals('INVOICES', $log->table_name);
    }
}
