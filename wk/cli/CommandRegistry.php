<?php
class CommandRegistry {
    private $commands = [];

    public function register($name, $command) {
        $this->commands[$name] = $command;
    }

    public function has($name) {
        return isset($this->commands[$name]);
    }

    public function get($name) {
        return $this->commands[$name] ?? null;
    }

    public function listCommands() {
        return array_keys($this->commands);
    }
}
