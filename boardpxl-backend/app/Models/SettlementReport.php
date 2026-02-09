<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @class SettlementReport
 * @brief Model representing a settlement report for a photographer
 * 
 * This class manages settlement reports for photographers,
 * including amounts, commissions and billing periods.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-26
 */
class SettlementReport extends Model
{
    use HasFactory;

    /**
     * @var string $table Table name associated with the model
     */
    protected $table = 'settlement_reports';

    /**
     * @var array $fillable Mass assignable attributes
     * List of columns that can be filled via mass assignment
     */
    protected $fillable = [
        'photographer_id',
        'pdf',
        'amount',
        'commission',
        'period_start_date',
        'period_end_date',
    ];

    /**
     * @var array $casts Type conversions for attributes
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'commission' => 'decimal:2',
        'period_start_date' => 'date',
        'period_end_date' => 'date',
    ];

    /**
     * Relationship with the Photographer model
     * A settlement report belongs to a photographer
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function photographer()
    {
        return $this->belongsTo(Photographer::class, 'photographer_id');
    }
}
