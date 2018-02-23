import utils, {
  cleanBlocks,
  determineInputs,
  interpolateInputs,
  createJsWrapperBlockCreator,
} from '@cdo/apps/block_utils';
import { parseElement, serialize } from '@cdo/apps/xml.js';
import { expect } from '../util/configuredChai';
import sinon from 'sinon';

describe('block utils', () => {
  describe('cleanBlocks', () => {
    let cleanDom;
    beforeEach(() => {
      cleanDom = parseElement(`
        <xml>
          <block type="jump_to_xy">
            <title name="XPOS">64</title>
            <title name="YPOS">42</title>
          </block>
        </xml>`).ownerDocument;
    });

    it('does nothing to blocks without unwanted attributes', () => {
      const before = serialize(cleanDom);

      cleanBlocks(cleanDom);

      expect(serialize(cleanDom)).to.equal(before);
    });

    it('removes uservisible="false" from blocks', () => {
      const blocksDom = parseElement(`
        <xml>
          <block type="jump_to_xy" uservisible="false">
            <title name="XPOS">64</title>
            <title name="YPOS">42</title>
          </block>
        </xml>`
      ).ownerDocument;

      cleanBlocks(blocksDom);

      expect(serialize(blocksDom)).to.equal(serialize(cleanDom));
    });
  });

  const TEST_SPRITES = [
    ['dog', '"dog"'],
    ['cat', '"cat"'],
  ];

  describe('interpolateInputs', () => {
    let fakeBlockly, fakeBlock, fakeInput;
    let appendDummyInput, appendTitle, setCheck, appendValueInput;
    beforeEach(() => {
      appendDummyInput = sinon.stub();
      appendValueInput = sinon.stub();
      fakeBlock = { appendDummyInput, appendValueInput };

      appendTitle = sinon.stub();
      setCheck = sinon.stub();
      fakeInput = { setCheck, appendTitle };

      appendDummyInput.returns(fakeInput);
      appendValueInput.returns(fakeInput);
      appendTitle.returns(fakeInput);
      setCheck.returns(fakeInput);

      fakeBlockly = {
        FieldDropdown: sinon.stub(),
      };
    });

    it('adds a dropdown input', () => {
      interpolateInputs(fakeBlockly, fakeBlock, [{
        mode: 'dropdown',
        name: 'ANIMATION',
        label: 'create sprite ',
        options: TEST_SPRITES,
      }]);

      expect(fakeBlockly.FieldDropdown).to.have.been.calledOnce;
      const dropdownArg = fakeBlockly.FieldDropdown.firstCall.args[0];
      expect(dropdownArg).to.deep.equal(TEST_SPRITES);
      expect(appendDummyInput).to.have.been.calledOnce;
      expect(appendTitle).to.have.been.calledWith(sinon.match.any, 'ANIMATION');
    });

    it('adds a value input', () => {
      interpolateInputs(fakeBlockly, fakeBlock, [{
        mode: 'value',
        name: 'DISTANCE',
        type: Blockly.BlockValueType.NUMBER,
        label: 'block title',
      }]);

      expect(appendValueInput).to.have.been.calledWith('DISTANCE');
      expect(setCheck).to.have.been.calledWith(Blockly.BlockValueType.NUMBER);
      expect(appendTitle).to.have.been.calledWith('block title');
    });

    it('adds a dummy input', () => {
      interpolateInputs(fakeBlockly, fakeBlock, [{
        mode: 'dummy',
        label: 'block title',
      }]);

      expect(appendDummyInput).to.have.been.calledOnce;
      expect(appendTitle).to.have.been.calledWith('block title');
    });

    it('adds all three', () => {
      interpolateInputs(fakeBlockly, fakeBlock, [
        {
          mode: 'dropdown',
          name: 'ANIMATION',
          label: 'dropdown ',
          options: TEST_SPRITES,
        },
        {
          mode: 'value',
          name: 'DISTANCE',
          type: Blockly.BlockValueType.NUMBER,
          label: 'value label',
        },
        {
          mode: 'dummy',
          label: 'dummy label',
        },
      ]);

      expect(appendTitle).to.have.been.calledWith(sinon.match.any, 'ANIMATION');
      expect(appendTitle).to.have.been.calledWith('value label');
      expect(appendTitle).to.have.been.calledWith('dummy label');
    });
  });

  describe('determineInputs', () => {
    const { NUMBER } = Blockly.BlockValueType;

    it('creates a single dummy input for no inputs', () => {
      const inputs = determineInputs('block text', []);
      expect(inputs).to.deep.equal([{
        mode: 'dummy',
        label: 'block text',
      }]);
    });

    it('creates a dropdown input', () => {
      const inputs = determineInputs('create a {ANIMATION} sprite', [
        {
          name: 'ANIMATION',
          options: TEST_SPRITES,
        },
      ]);
      expect(inputs).to.deep.equal([
        {
          mode: 'dropdown',
          name: 'ANIMATION',
          label: 'create a ',
          options: TEST_SPRITES,
        },
        {
          mode: 'dummy',
          label: ' sprite',
        },
      ]);
    });

    it('creates a value input', () => {
      const inputs = determineInputs('move {DISTANCE} pixels', [
        {
          name: 'DISTANCE',
          type: NUMBER,
        },
      ]);
      expect(inputs).to.deep.equal([
        {
          mode: 'value',
          name: 'DISTANCE',
          type: NUMBER,
          label: 'move ',
        },
        {
          mode: 'dummy',
          label: ' pixels',
        },
      ]);
    });

    it('creates both inputs', () => {
      const inputs = determineInputs('create a {ANIMATION} sprite at {X} {Y}', [
        { name: 'ANIMATION', options: TEST_SPRITES },
        { name: 'X', type: NUMBER},
        { name: 'Y', type: NUMBER},
      ]);
      expect(inputs).to.deep.equal([
        {
          mode: 'dropdown',
          name: 'ANIMATION',
          options: TEST_SPRITES,
          label: 'create a ',
        },
        { mode: 'value', name: 'X', type: NUMBER, label: ' sprite at ' },
        { mode: 'value', name: 'Y', type: NUMBER, label: ' ' },
      ]);
    });

    it('removes trailing empty strings', () => {
      const inputs = determineInputs('set speed to {SPEED}', [
        { name: 'SPEED', type: NUMBER},
      ]);
      expect(inputs).to.deep.equal([
        { mode: 'value', name: 'SPEED', type: NUMBER, label: 'set speed to ' },
      ]);
    });
  });

  describe('createJsWrapperBlockCreator', () => {
    let createJsWrapperBlock;
    let fakeBlockly, generators, fakeBlock;
    const { ORDER_FUNCTION_CALL, ORDER_NONE } = Blockly.JavaScript;

    before(() => {
      sinon.stub(utils, 'interpolateInputs');
      sinon.spy(utils, 'determineInputs');
      sinon.stub(Blockly.JavaScript, 'valueToCode').returnsArg(1);
    });
    after(() => {
      utils.interpolateInputs.restore();
      utils.determineInputs.restore();
      Blockly.JavaScript.valueToCode.restore();
    });

    beforeEach(() => {
      utils.interpolateInputs.reset();
      utils.determineInputs.reset();
      Blockly.JavaScript.valueToCode.resetHistory();

      generators = {};
      fakeBlockly = {
        Blocks: {},
        Generator: {
          get: () => generators,
        },
      };
      fakeBlock = {
        setHSV: sinon.stub(),
        setOutput: sinon.stub(),
        setInputsInline: sinon.stub(),
        appendStatementInput: sinon.stub(),
        setNextStatement: sinon.stub(),
        setPreviousStatement: sinon.stub(),
      };

      createJsWrapperBlock = createJsWrapperBlockCreator(fakeBlockly, 'ramlab');
    });

    const fakeInstall = () => {
      Object.keys(fakeBlockly.Blocks).map(key =>
        Object.assign(fakeBlockly.Blocks[key], fakeBlock));
      Object.values(fakeBlockly.Blocks).map(block => block.init());
    };

    it('creates a block for a zero-argument function', () => {
      createJsWrapperBlock({
        func: 'foo',
        blockText: 'do something',
      });
      fakeInstall();
      const code = generators['ramlab_foo']();

      expect(utils.determineInputs).to.have.been.calledWith('do something', []);
      expect(fakeBlockly.Blocks.ramlab_foo.setOutput).to.have.not.been.called;
      expect(fakeBlock.appendStatementInput).to.have.not.been.called;
      expect(fakeBlock.skipNextBlockGeneration).to.be.undefined;
      expect(fakeBlock.setNextStatement).to.have.been.calledWith(true);
      expect(fakeBlock.setPreviousStatement).to.have.been.calledWith(true);

      expect(code).to.equal('foo();\n');
    });

    it('creates a block for a zero-argument function that returns', () => {
      createJsWrapperBlock({
        func: 'bar',
        blockText: 'get something',
        returnType: Blockly.BlockValueType.NUMBER,
      });
      fakeInstall();
      const code = generators['ramlab_bar']();

      expect(fakeBlock.setOutput).to.have.been.calledWith(
        true, Blockly.BlockValueType.NUMBER);
      expect(fakeBlock.setNextStatement).to.have.not.been.called;
      expect(fakeBlock.setPreviousStatement).to.have.not.been.called;

      expect(code).to.deep.equal(['bar()', ORDER_FUNCTION_CALL]);
    });

    it('creates a block for a one argument function', () => {
      createJsWrapperBlock({
        func: 'baz',
        args: [{ name: 'ARG' }],
        blockText: 'process {ARG}',
      });
      fakeInstall();
      const code = generators['ramlab_baz']();

      expect(utils.determineInputs).to.have.been.calledWith(
        'process {ARG}', [{ name: 'ARG' }]);
      expect(code).to.deep.equal('baz(ARG);\n');
    });

    it('creates a block for a one argument method', () => {
      createJsWrapperBlock({
        func: 'qux',
        args: [{ name: 'THAT' }],
        blockText: '{THIS} chases {THAT}',
        methodCall: true,
      });
      fakeInstall();
      const code = generators['ramlab_qux']();

      expect(utils.determineInputs).to.have.been.calledWith(
        '{THIS} chases {THAT}', [{ name: 'THAT' }, { name: 'THIS' }]);
      expect(code).to.deep.equal('THIS.qux(THAT);\n');
    });

    it('creates a block for an expression with return type', () => {
      createJsWrapperBlock({
        expression: 'quux[0]',
        name: 'quux',
        blockText: 'swish and flick',
        returnType: Blockly.BlockValueType.NUMBER,
      });
      fakeInstall();
      const code = generators['ramlab_quux']();

      expect(code).to.deep.equal(['quux[0]', ORDER_NONE]);
    });

    it('creates a block for an expression without return type', () => {
      createJsWrapperBlock({
        expression: 'const a',
        name: 'corge',
        blockText: 'swish and flick',
      });
      fakeInstall();
      const code = generators['ramlab_corge']();

      expect(code).to.deep.equal('const a;\n');
    });
  });
});
