<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Logs extends Model
{
    use HasFactory;

    protected $fillable = [
        'action_id',
        'user_id',
        'table_name',
        'ip_address',
        'details',
    ];

    public function logAction(){
        return $this->belongsTo(LogActions::class);
    }
}
