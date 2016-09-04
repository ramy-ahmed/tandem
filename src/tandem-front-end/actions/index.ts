import { Action } from "tandem-common/actions";
import { IActor } from "tandem-common/actors";
import { toArray } from "tandem-common/utils/array";
import { IRange, IPoint } from "tandem-common/geom";
import { IEditor, IEditorTool, IHistoryItem } from "tandem-front-end/models";
import { EditorToolFactoryDependency } from "tandem-front-end/dependencies";

export const CANVAS_MOUSE_DOWN = "canvasMouseDown";
export const SELECTION_DOUBLE_CLICK = "selectionDoubleClick";
export class MouseAction extends Action {
  constructor(type, readonly originalEvent: MouseEvent) {
    super(type);
    Object.assign(this, {
      clientX : originalEvent.clientX,
      clientY : originalEvent.clientY,
      metaKey : originalEvent.metaKey
    });
  }
  preventDefault() {
    this.originalEvent.preventDefault();
  }
}

export const CANVAS_KEY_DOWN = "canvasKeyDown";
export class KeyboardAction extends Action {
  readonly keyCode: number;
  readonly which: number;
  constructor(type, readonly originalEvent: KeyboardEvent) {
    super(type);
    Object.assign(this, {
      which : originalEvent.which,
      keyCode: originalEvent.keyCode
    });
  }

  preventDefault() {
    this.originalEvent.preventDefault();
  }
}

export const SELECT = "select";
export class SelectAction extends Action {

  public items: Array<any>;
  public keepPreviousSelection: boolean;
  public toggle: boolean;

  constructor(items: any = undefined, keepPreviousSelection = false, toggle = false) {
    super(SELECT);
    this.items = toArray(items);
    this.keepPreviousSelection = !!keepPreviousSelection;
    this.toggle = toggle;
  }
}

export const SELECT_ALL = "selectAll";
export class SelectAllAction extends Action {
  constructor() {
    super(SELECT_ALL);
  }
}

export const SELECT_SOURCE_AT_OFFSET = "selectAtSourceOffset";
export class SelectSourceAtOffsetAction extends Action {
  readonly data: Array<IRange>;
  constructor(...data: Array<IRange>) {
    super(SELECT_SOURCE_AT_OFFSET);
    this.data = data;
  }
}

export class ToggleSelectAction extends SelectAction {
  constructor(items = undefined, keepPreviousSelection: boolean = false) {
    super(items, keepPreviousSelection, true);
  }
}

export class ZoomAction extends Action {
  static readonly ZOOM = "zoom";
  constructor(readonly delta: number, readonly ease: boolean = false) {
    super(ZoomAction.ZOOM);
  }
}

export const PASTE = "paste";
export class PasteAction extends Action {
  constructor(readonly item: DataTransferItem) {
    super(PASTE);
  }
}

export const DELETE_SELECTION = "deleteSelection";
export class DeleteSelectionAction extends Action {
  constructor() {
    super(DELETE_SELECTION);
  }
}

export class SetToolAction extends Action {
  static readonly SET_TOOL = "setTool";
  constructor(readonly toolFactory: { create(editor: IEditor): IEditorTool }) {
    super(SetToolAction.SET_TOOL);
  }
}

export const KEY_COMMAND = "keyCommand";
export class KeyCommandAction extends Action {
  constructor(readonly combo: string) {
    super(KEY_COMMAND);
  }
}

export const UNDO = "undo";
export class UndoAction extends Action {
  constructor() {
    super(UNDO);
  }
}

export const REDO = "redo";
export class RedoAction extends Action {
  constructor() {
    super(REDO);
  }
}

export const REMOVE_SELECTION = "removeSelection";
export class RemoveSelectionAction extends Action {
  constructor() {
    super(REMOVE_SELECTION);
  }
}