<?php
class BaseCommand {
    protected function output($message) {
        return $message . PHP_EOL;
    }

    public function execute($args = []) {
        return $this->output('Command executed');
    }
}
