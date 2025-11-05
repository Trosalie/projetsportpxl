<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\InvoiceStatus;

class CreateInvoicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('description');
            $table->date('date_emission');
            $table->date('date_echeance');
            $table->enum('statut', array_column(InvoiceStatus::cases(), 'value'))->default(InvoiceStatus::NON_PAYEE->value);
            $table->string('lien_pdf');
            $table->foreignId('photographer_id')->constrained()->onDelete('cascade');
            $table->nullableMorphs('invoiceable');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('invoices');
    }
}
