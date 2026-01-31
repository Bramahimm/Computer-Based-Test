<?php

namespace App\Http\Controllers\Admin;

/**
 * Compatibility wrapper controller for the old AnalyticsController.
 * Extends the new StatisticsController so existing imports keep working.
 */
class AnalyticsController extends StatisticsController
{
    // Intentionally empty; inherits behavior from StatisticsController
}
