<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_reactions', function (Blueprint $table) {
            $table->id();
            $table->string('message_id'); // For both private (UUID) and group (int)
            $table->unsignedBigInteger('user_id');
            $table->string('reaction');
            $table->string('message_type')->default('private'); // 'private' or 'group'
            $table->timestamps();

            $table->unique(['message_id', 'user_id', 'reaction']);
            
            $table->index('message_id');
            $table->index('user_id');
            $table->index('message_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_reactions');
    }
};