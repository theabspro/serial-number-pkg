<?php

namespace Abs\SerialNumberPkg;

use Illuminate\Support\ServiceProvider;

class SerialNumberPkgServiceProvider extends ServiceProvider {
	/**
	 * Register services.
	 *
	 * @return void
	 */
	public function register() {
		$this->loadRoutesFrom(__DIR__ . '/routes/web.php');
		$this->loadRoutesFrom(__DIR__ . '/routes/api.php');
		$this->loadMigrationsFrom(__DIR__ . '/migrations');
		$this->loadViewsFrom(__DIR__ . '/views', 'serial-number-pkg');
		$this->publishes([
			__DIR__ . '/public' => base_path('public'),
		]);
	}

	/**
	 * Bootstrap services.
	 *
	 * @return void
	 */
	public function boot() {
		// $this->app->make('Abs\Basic\API\AuthController');
	}
}
