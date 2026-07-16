<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ch_messages', function (Blueprint $table) {
            $table->string('reply_to_id')->nullable()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('ch_messages', function (Blueprint $table) {
            $table->dropColumn('reply_to_id');
        });
    }
};