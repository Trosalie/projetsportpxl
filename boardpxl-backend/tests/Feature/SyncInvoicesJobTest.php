<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Jobs\SyncInvoicesJob;
use App\Services\PennyLaneService;
use Mockery\MockInterface;

class SyncInvoicesJobTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test que le job SyncInvoices appelle la méthode syncInvoices du service
     */
    public function test_sync_invoices_job_calls_service_method(): void
    {
        $mockService = $this->mock(PennyLaneService::class, function (MockInterface $mock) {
            $mock->shouldReceive('syncInvoices')->once();
        });     

        $job = new SyncInvoicesJob($mockService);
        $job->handle();

        // Vérification faite par Mockery automatiquement
    }

    /**
     * Test que le job peut être instancié avec une dépendance
     */
    public function test_sync_invoices_job_instantiation(): void
    {
        $service = new PennyLaneService();
        $job = new SyncInvoicesJob($service);

        $this->assertInstanceOf(SyncInvoicesJob::class, $job);
    }
}
