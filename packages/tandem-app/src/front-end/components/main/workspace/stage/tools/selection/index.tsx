import "./index.scss";
import * as React from "react";
import { compose, pure, lifecycle, withHandlers } from "recompose";
import { Resizer } from "./resizer";
import { SelectionLabel } from "./label";
import { SyntheticBrowser } from "aerial-browser-sandbox";
import { Dispatcher, mergeBounds, Bounded, wrapEventToDispatch } from "aerial-common2";
import { Workspace, getBoundedWorkspaceSelection, getSyntheticBrowserItemBounds } from "front-end/state";
import { selectorDoubleClicked } from "front-end/actions";

export type SelectionOuterProps = {
  workspace: Workspace;
  browser: SyntheticBrowser;
  dispatch: Dispatcher<any>;
  zoom: number;
}

export type SelectionInnerProps = {
  setSelectionElement(element: HTMLDivElement);
  onDoubleClick(event: React.MouseEvent<any>);
} & SelectionOuterProps;

const  SelectionBounds = ({ workspace, browser, zoom }: { workspace: Workspace, browser: SyntheticBrowser, zoom: number }) => {
  const selection = getBoundedWorkspaceSelection(browser, workspace);
  const entireBounds = mergeBounds(...selection.map(value => getSyntheticBrowserItemBounds(browser, value)));
  const style = {};
  const borderWidth = 1 / zoom;
  const boundsStyle = {
    position: "absolute",
    top: entireBounds.top,
    left: entireBounds.left,
    width: entireBounds.right - entireBounds.left,
    height: entireBounds.bottom - entireBounds.top,
    boxShadow: `inset 0 0 0 ${borderWidth}px #00B5FF`
  };
  return <div style={boundsStyle as any}></div>;
};

export const  SelectionStageToolBase = ({ workspace, browser, dispatch, onDoubleClick, zoom }: SelectionInnerProps) => {
  const selection = getBoundedWorkspaceSelection(browser, workspace);      
  if (!selection.length || workspace.stage.secondarySelection) return null;

  return <div className="m-stage-selection-tool" tabIndex={-1} onDoubleClick={onDoubleClick}>
    <SelectionBounds workspace={workspace} browser={browser} zoom={zoom} />
    <Resizer workspace={workspace} browser={browser} dispatch={dispatch} zoom={zoom} />
  </div>;
};

const enhanceSelectionStageTool = compose<SelectionInnerProps, SelectionOuterProps>(
  pure,
  withHandlers({
    onDoubleClick: ({ dispatch, workspace, browser }: SelectionInnerProps) => (event: React.MouseEvent<any>) => {
      const selection = getBoundedWorkspaceSelection(browser, workspace);      
      if (selection.length === 1) {
        dispatch(selectorDoubleClicked(selection[0], event));
      }
    }
  })
);

export const  SelectionStageTool = enhanceSelectionStageTool(SelectionStageToolBase);

export * from "./resizer";