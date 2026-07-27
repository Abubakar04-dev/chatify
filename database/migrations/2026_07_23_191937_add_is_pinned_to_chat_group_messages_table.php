<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('chat_group_messages', function (Blueprint $table) {
            $table->boolean('is_pinned')->default(false)->after('reply_to_id');
            $table->timestamp('pinned_at')->nullable()->after('is_pinned');
            $table->unsignedBigInteger('pinned_by')->nullable()->after('pinned_at');
        });
    }

    public function down()
    {
        Schema::table('chat_group_messages', function (Blueprint $table) {
            $table->dropColumn(['is_pinned', 'pinned_at', 'pinned_by']);
        });
    }
};