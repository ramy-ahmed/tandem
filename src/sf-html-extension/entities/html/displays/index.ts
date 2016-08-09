import { BoundingRect, IPosition } from "sf-core/geom";
import { VisibleHTMLElementEntity } from "../base";
import { IEntityDisplay, IVisibleEntity, DisplayCapabilities } from "sf-core/entities";
import { parse as parseCSS } from "sf-html-extension/parsers/css";
import { WrapBus } from "mesh";
import { CSSStyleExpression, CSSStyleDeclarationExpression } from "sf-html-extension/parsers/css/expressions";

function calculateCSSMeasurments(style) {
  const calculated = {};
  for (const key in style) {
    if (hasMeasurement(key)) {
      calculated[key] = Number(style[key].replace("px", ""));
    }
  }
  return calculated;
}

function hasMeasurement(key) {
  return /left|top|right|bottom|width|height|padding|margin/.test(key);
}

function roundMeasurements(style) {
  const roundedStyle = {};
  for (const key in style) {
    const measurement: string = roundedStyle[key] = style[key];
    if (hasMeasurement(key)) {
      const value = measurement.match(/^(-?[\d\.]+)/)[1];
      const unit  = measurement.match(/([a-z]+)$/)[1];

      // ceiling is necessary here for zoomed in elements
      roundedStyle[key] = Math.ceil(Number(value)) + unit;
    }
  }

  return roundedStyle;
}

export class HTMLNodeDisplay implements IEntityDisplay {

  private _styleExpression: CSSStyleExpression;
  private _style: Object;
  private _declarationByKey: Object;

  constructor(readonly entity: VisibleHTMLElementEntity) {
    entity.observe(WrapBus.create(this._updateStyles));
    this._updateStyles();
  }

  /**
   */

  get capabilities() {

    const style = window.getComputedStyle(this.node);

    // TODO - need to wire this up
    return new DisplayCapabilities(
      style.position !== "static",
      /fixed|absolute/.test(style.position) || !/^inline$/.test(style.display)
    );
  }

  get position(): IPosition {
    const bounds = this.bounds;
    return { left: bounds.left, top: bounds.top };
  }

  /**
   */

  set position({ left, top }: IPosition) {
    const bounds = this.bounds;
    this.bounds = new BoundingRect(left, top, left + bounds.width, top + bounds.height);
  }

  /**
   * returns the DOM node of the entity
   */

  get node(): HTMLElement {
    return <any>this.entity.section.targetNode;
  }

  /**
   * returns TRUE if the child node display information is isolated - meaning
   * that they need to consider *THIS* display object when calculating bounding
   * rect information
   */

  get isolatedChildNodes(): boolean {
    return /iframe/i.test(this.node.nodeName);
  }

  /**
   * the bounds of the visible element
   */

  get bounds(): BoundingRect {
    const clientRect: ClientRect = this.node.getBoundingClientRect();

    // convert into something that is not DOM specific
    let rect: BoundingRect = new BoundingRect(clientRect.left, clientRect.top, clientRect.right, clientRect.bottom);
    rect = this._addIsolationOffset(rect);

    return rect;
  }

  set bounds(value: BoundingRect) {

    const bounds = this.bounds;

    const existingStyle: any = calculateCSSMeasurments(this._style);
    const computedStyle: any = calculateCSSMeasurments(window.getComputedStyle(this.node));

    let newStyle: any = {};

    const transforms = this._calculateTransforms();
    const scaled = value.move(-transforms.left, -transforms.top).zoom(1 / transforms.scale);

    if (value.left !== bounds.left) {
      // const scale = bounds.left / (existingStyle.left || 0);
      // const originLeft = bounds.left - existingStyle.left || 0;
      newStyle.left = scaled.left + "px";
    }

    if (value.top !== bounds.top) {
      const originTop  = bounds.top  - existingStyle.top || 0;
      newStyle.top = scaled.top + "px";
    }

    if (Math.round(value.width) !== Math.round(bounds.width)) {
      newStyle.width = (scaled.width - computedStyle.paddingLeft - computedStyle.paddingRight) + "px";
    }

    if (Math.round(value.height) !== Math.round(bounds.height)) {
      newStyle.height = (scaled.height - computedStyle.paddingTop - computedStyle.paddingBottom) + "px";
    }

    newStyle = roundMeasurements(newStyle);

    this._setExpressionStyle(newStyle);
  }

  private _addIsolationOffset(rect: BoundingRect): BoundingRect {
    for (const display of this._getParentDisplays()) {
      if (display.isolatedChildNodes) {
        const parentBounds = display.bounds;
        return rect.move(parentBounds.left, parentBounds.top);
      }
    }
    return rect;
  }

  private _getParentDisplays(): Array<HTMLNodeDisplay> {
    let p = this.entity.parentNode;
    const parentDisplays = [];
    while (p) {
      if ((<IVisibleEntity><any>p).display instanceof HTMLNodeDisplay) {
        parentDisplays.push(<HTMLNodeDisplay>(<IVisibleEntity><any>p).display);
      }
      p = p.parentNode;
    }
    return parentDisplays;
  }

  private _updateStyles = () => {
    const style = this.entity.getAttribute("style") || "";
    this._styleExpression = <CSSStyleExpression>parseCSS(style);
    this._style = {};
    this._declarationByKey = {};
    for (const declaration of this._styleExpression.declarations) {
      this._style[declaration.key] = declaration.value.toString();
      this._declarationByKey[declaration.key] = declaration;
    }
  }

  private _setExpressionStyle(styles: Object) {

    for (const key in styles) {
      const value = styles[key];

      let declaration: CSSStyleDeclarationExpression;
      if ((declaration = this._declarationByKey[key])) {
        declaration.value = value;
      } else {
        this._styleExpression.declarations.push(new CSSStyleDeclarationExpression(key, value, null));
      }
    }

    this.entity.setAttribute("style", this._styleExpression.toString());
  }

  /**
   */

  private _calculateTransforms() {

    const computedStyle: any = calculateCSSMeasurments(window.getComputedStyle(this.node));

    const oldLeft      = this.node.style.left;
    const oldTop       = this.node.style.top;
    const oldWidth     = this.node.style.width;
    const oldBoxSizing = this.node.style.boxSizing;

    this.node.style.left = "0px";
    this.node.style.top = "0px";
    this.node.style.width = "100px";
    this.node.style.boxSizing = "border-box";

    const bounds = this.bounds;

    const scale = bounds.width / 100;
    const left  = bounds.left;
    const top   = bounds.top;

    this.node.style.left      = oldLeft;
    this.node.style.top       = oldTop;
    this.node.style.width     = oldWidth;
    this.node.style.boxSizing = oldBoxSizing;

    return { scale, left, top };
  }
}