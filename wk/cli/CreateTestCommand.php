<?php
class CreateTestCommand extends BaseCommand {
    public function execute($args = []) {
        $name = $args[0] ?? 'Test';
        return $this->output('Create test request for ' . $name . '.');
    }
}
