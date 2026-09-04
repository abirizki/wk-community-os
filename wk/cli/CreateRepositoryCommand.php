<?php
class CreateRepositoryCommand extends BaseCommand {
    public function execute($args = []) {
        $name = $args[0] ?? 'Repository';
        return $this->output('Create repository request for ' . $name . '.');
    }
}
