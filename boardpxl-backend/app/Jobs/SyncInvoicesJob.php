<?php

namespace App\Jobs;

use App\Services\PennyLaneService;

class SyncInvoicesJob extends Job
{
    protected $service;

    public function __construct(PennyLaneService $service)
    {
        $this->service = $service;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->service->syncInvoices();
    }
}
