<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePhotographersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('photographers', function (Blueprint $table) {
            $table->id();
            $table->string('aws_sub')->unique();
            $table->string('email')->unique();
            $table->string('family_name')->nullable();
            $table->string('given_name')->nullable();
            $table->string('name');
            $table->string('customer_stripe_id')->nullable();
            $table->integer('nb_imported_photos')->default(0);
            $table->integer('total_limit')->default(0);
            $table->decimal('fee_in_percent', 5, 2);
            $table->decimal('fix_fee', 5, 2);
            $table->string('street_address')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('locality')->nullable();
            $table->string('country')->nullable();
            $table->string('iban')->nullable();
            $table->integer('pennylane_id')->nullable();
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
        Schema::dropIfExists('photographers');
    }
}
