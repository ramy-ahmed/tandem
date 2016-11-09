import * as React from "react";
import { kebabCase, camelCase } from "lodash";
import { Workspace } from "@tandem/editor/browser/models";
import { DOMElements, MatchedStyleRule } from "@tandem/html-extension/collections";
import { GutterComponent } from "@tandem/editor/browser/components";
import { HashInputComponent } from "@tandem/html-extension/editor/browser/components/common";
import { ApplyFileEditAction } from "@tandem/sandbox";
import { CSSPrettyPaneComponent } from "./pretty";
import { BaseApplicationComponent } from "@tandem/common";
import { SyntheticCSSStyleRule, SyntheticCSSStyleDeclaration } from "@tandem/synthetic-browser";

export class CSSStylePaneComponent extends BaseApplicationComponent<{ title: string, titleClassName?: string, style: SyntheticCSSStyleDeclaration, setDeclaration: (key, value, oldKey?) => any, pretty?: boolean, overriden?: any}, any> {
  render() {
    const { setDeclaration, title, style, titleClassName, pretty, overriden } = this.props;
    const items = [];

    for (const key of style) {
      const value = style[key];
      items.push({ name: kebabCase(key), value: style[key], overriden: overriden && overriden[key] });
    }

    return <div>
      <div className={["td-section-header", titleClassName].join(" ")}>
        { title }
        <div className="controls">
          <span onClick={() => setDeclaration("", "")}>+</span>
        </div>
      </div>
      { pretty ? <CSSPrettyPaneComponent style={style} /> : <HashInputComponent items={items} setKeyValue={setDeclaration} /> }
    </div>
  }
}


// TODO - add some color for the CSS rules
class MatchedCSSStyleRuleComponent extends BaseApplicationComponent<{ rule: MatchedStyleRule }, any> {
  setDeclaration = (name: string, value: string, oldName?: string) => {
    this.props.rule.value.style.setProperty(name, value, undefined, oldName);
    const edit = this.props.rule.value.createEdit();
    if (value !== "") {
      edit.setDeclaration(name, value, oldName);
    }
    this.bus.execute(new ApplyFileEditAction(edit.actions));
  }
  render() {
    const { rule } = this.props;

    return <CSSStylePaneComponent style={rule.value.style} title={rule.value.selector} titleClassName="color-green-10" setDeclaration={this.setDeclaration} overriden={rule.overridedDeclarations} />
  }
}

export class ElementCSSPaneComponent extends React.Component<{ workspace: Workspace }, any> {
  render() {
    if (!this.props.workspace) return null;
    const { selection } = this.props.workspace;
    const elements = DOMElements.fromArray(selection);
    return <div className="td-pane">
      { elements.matchedCSSStyleRules.map((matchedRule, index) => {
        return <MatchedCSSStyleRuleComponent rule={matchedRule} key={index} />
      }) }
    </div>
  }
}