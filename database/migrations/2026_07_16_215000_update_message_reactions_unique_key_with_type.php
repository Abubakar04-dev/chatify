<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, let's check what indexes exist
        $indexes = DB::select('SHOW INDEX FROM message_reactions');
        $indexNames = array_column($indexes, 'Key_name');
        
        // Drop the old unique key if it exists
        if (in_array('message_reactions_message_id_user_id_reaction_unique', $indexNames)) {
            Schema::table('message_reactions', function (Blueprint $table) {
                $table->dropUnique('message_reactions_message_id_user_id_reaction_unique');
            });
        }
        
        // Check if the new unique key already exists
        if (!in_array('message_reactions_unique', $indexNames)) {
            Schema::table('message_reactions', function (Blueprint $table) {
                $table->unique(['message_id', 'user_id', 'reaction', 'message_type'], 
                    'message_reactions_unique');
            });
        }
    }

    public function down(): void
    {
        $indexes = DB::select('SHOW INDEX FROM message_reactions');
        $indexNames = array_column($indexes, 'Key_name');
        
        if (in_array('message_reactions_unique', $indexNames)) {
            Schema::table('message_reactions', function (Blueprint $table) {
                $table->dropUnique('message_reactions_unique');
            });
        }
    }
};