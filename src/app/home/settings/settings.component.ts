import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

export interface AppSettings{
  showLabels: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Input() settings: AppSettings;
  @Output() settingsChange = new EventEmitter<AppSettings>();

  constructor() { }

  ngOnInit(): void {
  }

  changeSetting(setting: string, value: any): void{
    this.settings[setting] = value;
    this.settingsChange.emit(this.settings);
  }
}
