<?php
class CommandRunner {
    private $registry;

    public function __construct($registry) {
        $this->registry = $registry;
    }

    public function run($name, $args = []) {
        $command = $this->registry->get($name);
        if (!$command) {
            return 'Unknown command: ' . $name . PHP_EOL;
        }

        return $command->execute($args);
    }
}
