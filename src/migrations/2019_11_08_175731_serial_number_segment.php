<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class SerialNumberSegment extends Migration {
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
		Schema::create('serial_number_segments', function (Blueprint $table) {
			$table->increments('id');
			$table->unsignedInteger('company_id');
			$table->string('name', 191);
			$table->unsignedInteger('data_type_id');
			$table->unsignedInteger('created_by_id')->nullable();
			$table->unsignedInteger('updated_by_id')->nullable();
			$table->unsignedInteger('deleted_by_id')->nullable();
			$table->timestamps();
			$table->softDeletes();
			$table->unique(["company_id", "name"]);
			$table->foreign('data_type_id')->references('id')->on('configs')->onDelete('CASCADE')->onUpdate('cascade');
			$table->foreign('company_id')->references('id')->on('companies')->onDelete('CASCADE')->onUpdate('cascade');
			$table->foreign('created_by_id')->references('id')->on('users')->onDelete('SET NULL')->onUpdate('cascade');
			$table->foreign('updated_by_id')->references('id')->on('users')->onDelete('SET NULL')->onUpdate('cascade');
			$table->foreign('deleted_by_id')->references('id')->on('users')->onDelete('SET NULL')->onUpdate('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down() {
		Schema::dropIfExists('serial_number_segments');
	}
}
