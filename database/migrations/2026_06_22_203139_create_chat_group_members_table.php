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
        Schema::create('chat_group_members', function (Blueprint $table) {

            $table->id();

            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('user_id');

            $table->boolean('is_admin')->default(false);

            $table->timestamps();

            $table->unique(['group_id', 'user_id']);

            $table->foreign('group_id')
                ->references('id')
                ->on('chat_groups')
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
        Schema::dropIfExists('chat_group_members');
    }
};
