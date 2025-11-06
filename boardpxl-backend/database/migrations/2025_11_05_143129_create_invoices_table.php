<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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
            $table->date('issue_date');
            $table->date('due_date');
            $table->string('status')->default('Non payée');
            $table->string('link_pdf');
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
