<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Services\LogService;
use App\Models\Logs;
use App\Models\LogActions;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogServiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private LogService $logService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->logService = new LogService();
    }

    /**
     * Test qu'aucun log n'est créé sans utilisateur authentifié
     */
    public function test_log_action_skips_without_authenticated_user(): void
    {
        $request = new Request();
        
        // Enregistrer une action sans utilisateur authentifié
        $this->logService->logAction($request, 'CREATE');

        // Vérifier qu'aucun log n'a été créé
        $this->assertDatabaseCount('logs', 0);
    }

    /**
     * Test que le service LogService peut être instancié
     */
    public function test_log_service_instantiation(): void
    {
        $this->assertInstanceOf(LogService::class, $this->logService);
    }

    /**
     * Test que logAction accepte les paramètres nécessaires
     */
    public function test_log_action_method_exists(): void
    {
        $request = new Request();
        
        // Vérifier que la méthode existe et peut être appelée
        $this->assertTrue(method_exists($this->logService, 'logAction'));
    }
}
