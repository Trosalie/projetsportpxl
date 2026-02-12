<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\PennylaneService;

class SyncInvoicesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:invoices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize invoices from Pennylane API';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        try {
            app(PennylaneService::class)->syncInvoices();
            $this->info('Invoices synchronized successfully.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error syncing invoices: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
