
import { MetadataKeys } from "@tandem/editor/constants";
import { FrontEndApplication } from "@tandem/editor/application";
import {
  IEntity,
  loggable,
  bindable,
  BaseEntity,
  BaseASTNode,
  flattenTree,
  BaseApplicationService,
  ApplicationServiceDependency,
} from "@tandem/common";

import {

} from "@tandem/synthetic-browser";

import {
  SelectAction,
  SelectAllAction,
  RemoveSelectionAction,
  SelectEntitiesAtSourceOffsetAction,
} from "@tandem/editor/actions";

import { DocumentFile } from "@tandem/editor/models";

@loggable()
export default class SelectorService extends BaseApplicationService<FrontEndApplication> {

  [SelectEntitiesAtSourceOffsetAction.SELECT_ENTITIES_AT_SOURCE_OFFSET](action: SelectEntitiesAtSourceOffsetAction) {

    if (!this.app.editor) return;

    const selectableSynthetics = flattenTree(this.app.editor.document).filter((element) => {
      return element;
    });

    // const selectableEntities = this.app.workspace.file.entity.flatten().filter((entity: IEntity) => {
    //   return entity.source.source ? String((<DocumentFile<any>>entity.source.source).path).indexOf(action.filePath) !== -1 && entity.metadata.get(MetadataKeys.SELECTABLE) !== false : false;
    // });

    // const selection = [];
    // const selectedSources = [];

    // for (const entity of selectableEntities) {

    //   const source = <BaseASTNode<any>>entity.source;

    //   for (const cursor of action.data) {
    //     if (source.inRange(cursor)) {

    //       const parentIndex = selection.indexOf(entity.parent);

    //       // there are cases where registered components will use the same source -- skip them.
    //       if (selectedSources.indexOf(entity.source) !== -1) continue;

    //       if (parentIndex > -1) {
    //         selection.splice(parentIndex, 1);
    //       }

    //       selection.push(entity);
    //       selectedSources.push(entity.source);
    //     }
    //   }
    // }

    // this.bus.execute(new SelectAction(selection, false, false));
  }

  /**
   */

  async [RemoveSelectionAction.REMOVE_SELECTION]() {

    Promise.all(this.app.editor.selection.map((selection) => {
      return selection.module.editor ? selection.module.editor.edit((edit) => {
        edit.remove(selection);
      }) : Promise.resolve();
    }));

    this.bus.execute(new SelectAction());
  }

  /**
   */

  [SelectAction.SELECT]({ items, toggle, keepPreviousSelection }) {
    const app = this.app;

    if (!items.length) {
      return app.editor.selection = [];
    }
    const prevSelection = app.editor.selection;

    const type = items[0].type;

    const newSelection = [];

    if (keepPreviousSelection) {
      newSelection.push(...prevSelection);
    } else {
      newSelection.push(...prevSelection.filter((item) => !!~items.indexOf(item)));
    }

    for (const item of items) {
      const i = newSelection.indexOf(item);
      if (~i) {
        if (toggle) {
          newSelection.splice(i, 1);
        }
      } else {
        newSelection.push(item);
      }
    }

    // parents and children cannot be selected. For now - deselect
    // parent entities that appear in the selection
    newSelection.concat().forEach((entity: IEntity) => {
      let i;
      if (entity.parent && (i = newSelection.indexOf(entity.parent)) !== -1) {
        newSelection.splice(i, 1);
      }
    });

    app.editor.selection = newSelection;

  }

  [SelectAllAction.SELECT_ALL]() {

    // TODO - select call based on focused entity
    this.bus.execute(new SelectAction(this.app.editor.document.body.children, false, false));
  }
}

export const selectorServiceDependency = new ApplicationServiceDependency("selector", SelectorService);