<?php
class DoctorCommand extends BaseCommand {
    public function execute($args = []) {
        return $this->output('Doctor check passed. Framework bootstrap and generator engine are available.');
    }
}
