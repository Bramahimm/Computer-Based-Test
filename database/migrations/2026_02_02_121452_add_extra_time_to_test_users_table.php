<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('test_users', function (Blueprint $table) {
            // Menambahkan kolom extra_time (integer, default 0)
            // Ditaruh setelah kolom finished_at biar rapi
            $table->integer('extra_time')->default(0)->nullable()->after('finished_at');
        });
    }

    public function down()
    {
        Schema::table('test_users', function (Blueprint $table) {
            $table->dropColumn('extra_time');
        });
    }
};
