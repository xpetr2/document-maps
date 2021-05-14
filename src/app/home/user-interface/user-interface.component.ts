import {Component, Input, Output, EventEmitter} from '@angular/core';
import {AppSettings} from './settings/settings.component';

/**
 * The component responsible for showing the user interface
 */
@Component({
  selector: 'app-user-interface',
  templateUrl: './user-interface.component.html',
  styleUrls: ['./user-interface.component.scss']
})
export class UserInterfaceComponent {

  /**
   * The current app settings
   */
  @Input() settings: AppSettings;
  /**
   * The ids of the selected nodes
   */
  @Input() selectedNodes: string[];
  /**
   * The offset in pixels of the deviance indicator
   */
  @Input() errorIndicatorOffset = 0;
  /**
   * Specifies the furthest the camera can zoom out
   */
  @Input() minZoom: number;
  /**
   * Specifies the closest the camera can zoom in
   */
  @Input() maxZoom: number;
  /**
   * The default camera zoom in/out step on button press
   */
  @Input() defaultStepZoom: number;
  /**
   * The current value of the zoom in/out level
   */
  @Input() currentZoom: number;

  /**
   * An event, emitting when the user requests to center the camera
   */
  @Output() centerCamera = new EventEmitter<void>();
  /**
   * An event, emitting when the user requests to zoom in the camera
   */
  @Output() increaseCamera = new EventEmitter<void>();
  /**
   * An event, emitting when the user requests to zoom out the camera
   */
  @Output() decreaseCamera = new EventEmitter<void>();
  /**
   * An event, emitting when the user uses the slider to change the camera zoom
   */
  @Output() changeCameraZoom = new EventEmitter<number>();
  /**
   * An event, emitting when the settings change
   */
  @Output() settingsChange = new EventEmitter<AppSettings>();

  /**
   * Specifies whether the settings menu is opened
   */
  settingsOpen: boolean;
}
