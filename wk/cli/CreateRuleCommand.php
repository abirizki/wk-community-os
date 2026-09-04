<?php
class CreateRuleCommand extends BaseCommand {
    public function execute($args = []) {
        $name = $args[0] ?? 'Rule';
        return $this->output('Create rule request for ' . $name . '.');
    }
}
