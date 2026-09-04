<?php
class CreateSeederCommand extends BaseCommand {
    public function execute($args = []) {
        $name = $args[0] ?? 'Seeder';
        return $this->output('Create seeder request for ' . $name . '.');
    }
}
