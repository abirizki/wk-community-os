<?php
class SmokeCommand extends BaseCommand {
    public function execute($args = []) {
        return $this->output('Smoke test command invoked.');
    }
}
