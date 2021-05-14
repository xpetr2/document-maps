import {Component, EventEmitter, Input, Output} from '@angular/core';

/**
 * The interface containing the app settings
 */
export interface AppSettings{
  showLabels: boolean;
  showDeviations: boolean;
  distanceModifier: number;
  clumpingModifier: number;
}

/**
 * The component containing the user interface for the settings menu
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  /**
   * The current app settings
   */
  @Input() settings: AppSettings;
  /**
   * An event, that emits when settings are changed
   */
  @Output() settingsChange = new EventEmitter<AppSettings>();

  /**
   * Changes the specified setting, using a string key
   * @param setting   The string key, corresponding to a specific key in AppSettings
   * @param value     The value being set to the setting key
   */
  changeSetting(setting: string, value: any): void{
    this.settings[setting] = value;
    this.settingsChange.emit(this.settings);
  }
}
