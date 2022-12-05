import { Window } from "happy-dom";
import { Scope, ScopeProps } from "./scope";
import { Value } from "./value";

export const ELEMENT_NODE = 1; //TODO
export const TEXT_NODE = 3; //TODO
export const COMMENT_NODE = 8; //TODO

export const LOGIC_ATTR_PREFIX = ':';
export const AKA_ATTR = LOGIC_ATTR_PREFIX + 'aka';

export const DOM_ID_ATTR = 'data-reflectjs';

export const ROOT_SCOPE_NAME = 'page';
export const HEAD_SCOPE_NAME = 'head';
export const BODY_SCOPE_NAME = 'body';

export const RESERVED_PREFIX = '__';
export const OUTER_PROPERTY = RESERVED_PREFIX + 'outer';
export const ATTR_VALUE_PREFIX = 'attr_';
export const TEXT_VALUE_PREFIX = RESERVED_PREFIX + 't';

export const TEXT_MARKER1_PREFIX = '-t';
export const TEXT_MARKER2 = '-/';

export const NOTNULL_FN = RESERVED_PREFIX + 'nn';

export interface PageProps {
  root: ScopeProps;
  cycle?: number;
}

/**
 * Page
 */
 export class Page {
  win: Window;
  doc: Document;
  dom: Element;
  props: PageProps;
  root: Scope;
  pushLevel?: number;

  constructor(win: Window, dom: Element, props: PageProps) {
    this.win = win;
    this.doc = dom.ownerDocument as unknown as Document;
    this.dom = dom;
    this.props = props;
    this.root = this.load(null, props.root);
    this.root.values[ROOT_SCOPE_NAME] = new Value({
      key: ROOT_SCOPE_NAME,
      val: this.root.proxy
    }, this.root);
  }

  load(parent: Scope | null, props: ScopeProps) {
    const ret = new Scope(this, parent, props);
    props.children?.forEach(props => {
      this.load(ret, props);
    });
    return ret;
  }

  refresh(scope?: Scope, noincrement?: boolean) {
    this.props.cycle
      ? (noincrement ? null : this.props.cycle++)
      : this.props.cycle = 1;
    delete this.pushLevel;
    scope || (scope = this.root);
    scope.unlinkValues();
    scope.relinkValues();
    scope.updateValues();
    this.pushLevel = 0;
    return this;
  }

  lookupGlobal(key: string): Value | undefined {
    return undefined;
  }

  getMarkup() {
    return '<!DOCTYPE html>' + this.doc.documentElement.outerHTML;
  }
}
