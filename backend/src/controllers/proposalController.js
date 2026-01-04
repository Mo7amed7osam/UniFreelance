const { acceptProposalWithEscrow } = require('../services/contractService');

const acceptProposal = async (req, res) => {
    try {
        const { proposalId } = req.params;
        const { agreedBudget } = req.body;
        const result = await acceptProposalWithEscrow({
            proposalId,
            clientId: req.user?.id,
            agreedBudget,
        });
        res.status(201).json(result);
    } catch (error) {
        const status = error?.status || 500;
        res.status(status).json({ message: error?.message || 'Error accepting proposal', error });
    }
};

module.exports = {
    acceptProposal,
};
