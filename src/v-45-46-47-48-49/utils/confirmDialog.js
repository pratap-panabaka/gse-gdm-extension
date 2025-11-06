import GObject from 'gi://GObject';

import * as Dialog from 'resource:///org/gnome/shell/ui/dialog.js';
import * as ModalDialog from 'resource:///org/gnome/shell/ui/modalDialog.js';

const ConfirmDialog = GObject.registerClass(
    {
        Signals: {
            cancel: {param_types: [GObject.TYPE_BOOLEAN]},
            proceed: {param_types: [GObject.TYPE_BOOLEAN]},
        },
    },
    class ConfirmDialog extends ModalDialog.ModalDialog {
        _init(dialog) {
            super._init({
                styleClass: 'end-session-dialog',
                destroyOnClose: true,
            });

            this._messageDialogContent = new Dialog.MessageDialogContent();

            this._messageDialogContent.description = dialog.description;
            this._messageDialogContent.title = dialog.subject;

            this.contentLayout.add_child(this._messageDialogContent);

            let buttons = [];
            for (let i = 0; i < dialog.confirmButtons.length; i++) {
                let signal = dialog.confirmButtons[i].signal;
                let label = dialog.confirmButtons[i].label;
                let key = dialog.confirmButtons[i].key;
                buttons.push({
                    action: () => {
                        let signalId = this.connect('closed', () => {
                            this.disconnect(signalId);
                            this.emit(signal, false);
                        });
                        this.close();
                    },
                    label,
                    key,
                });
            }

            this.setButtons(buttons);
        }
    }
);

export default ConfirmDialog;
