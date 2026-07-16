<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_group_messages', function (Blueprint $table) {
            $table->unsignedBigInteger('reply_to_id')->nullable()->after('id');
            $table->foreign('reply_to_id')->references('id')->on('chat_group_messages')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('chat_group_messages', function (Blueprint $table) {
            $table->dropForeign(['reply_to_id']);
            $table->dropColumn('reply_to_id');
        });
    }
};