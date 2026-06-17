<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('notifications:process-scheduled')->everyMinute();
Schedule::command('ai:index-content')->daily();
