<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MailLogs extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'recipient',
        'subject',
        'status',
        'type'
    ];

    public function photographer()
    {
        return $this->belongsTo(Photographer::class, 'sender_id');
    }
}
