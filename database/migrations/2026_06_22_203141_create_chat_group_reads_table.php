<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chat_group_reads', function (Blueprint $table) {

            $table->id();

            $table->unsignedBigInteger('message_id');

            $table->unsignedBigInteger('user_id');

            $table->timestamp('seen_at')->nullable();

            $table->timestamps();

            $table->unique(['message_id', 'user_id']);

            $table->foreign('message_id')
                ->references('id')
                ->on('chat_group_messages')
                ->cascadeOnDelete();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_group_reads');
    }
};
