<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\LogActions;

class LogActionsTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test que le modèle LogActions existe
     */
    public function test_log_actions_model_exists(): void
    {
        $this->assertInstanceOf(LogActions::class, new LogActions());
    }

    /**
     * Test le nom de la table
     */
    public function test_log_actions_table_name(): void
    {
        $logAction = new LogActions();
        $this->assertEquals('log_actions', $logAction->getTable());
    }

    /**
     * Test les attributs de LogActions
     */
    public function test_log_actions_has_fillable(): void
    {
        $logAction = new LogActions();
        $logAction->action = 'CREATE';
        
        $this->assertEquals('CREATE', $logAction->action);
    }
}
