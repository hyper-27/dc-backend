const asyncHandler = require('express-async-handler');
const Decision = require('../models/Decision');
const Rating = require('../models/Rating');

// @desc    Get all decisions for the authenticated user
// @route   GET /api/decisions
// @access  Private
const getDecisions = asyncHandler(async (req, res) => {
    try {
        const decisions = await Decision.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(decisions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @desc    Create a new decision
// @route   POST /api/decisions
// @access  Private
const createDecision = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authorized, user ID missing.' });
    }

    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Decision title is required.' });
    }

    try {
        const newDecision = await Decision.create({
            user: req.user.id,
            title,
            description: description || '',
            alternatives: [],
            criteria: [],
        });
        res.status(201).json(newDecision);
    } catch (error) {
        console.error('Error creating decision:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get a single decision by ID for the authenticated user
// @route   GET /api/decisions/:id
// @access  Private
const getDecisionById = asyncHandler(async (req, res) => {
    try {
        const decision = await Decision.findById(req.params.id);

        if (!decision) {
            return res.status(404).json({ message: 'Decision not found' });
        }

        if (decision.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this decision' });
        }

        res.json(decision);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Decision not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @desc    Update a decision by ID
// @route   PUT /api/decisions/:id
// @access  Private
const updateDecision = async (req, res) => {
    const { id } = req.params;
    const { title, description, alternatives, criteria } = req.body;

    try {
        let decision = await Decision.findById(id);

        if (!decision) {
            return res.status(404).json({ message: 'Decision not found' });
        }

        if (decision.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to update this decision' });
        }

        decision.title = title || decision.title;
        decision.description = description !== undefined ? description : decision.description;

        if (alternatives !== undefined) {
            decision.alternatives = alternatives;
        }
        if (criteria !== undefined) {
            decision.criteria = criteria;
        }

        decision = await decision.save();

        res.json(decision);
    } catch (err) {
        console.error('Error in updateDecision:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a decision by ID
// @route   DELETE /api/decisions/:id
// @access  Private
const deleteDecision = asyncHandler(async (req, res) => {
    try {
        const decision = await Decision.findById(req.params.id);

        if (!decision) {
            return res.status(404).json({ message: 'Decision not found' });
        }

        if (decision.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this decision' });
        }

        // Also delete associated ratings when a decision is deleted
        await Rating.deleteMany({ decision: req.params.id });

        await Decision.deleteOne({ _id: req.params.id });
        res.json({ message: 'Decision removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Decision not found' });
        }
        res.status(500).send('Server Error');
    }
});

// --- Alternative CRUD Operations (Basic Implementations) ---

// @desc    Add an alternative to a decision
// @route   POST /api/decisions/:id/alternatives
// @access  Private
const addAlternative = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const { id } = req.params; // decisionId

    if (!name) {
        return res.status(400).json({ message: 'Alternative name is required.' });
    }

    const decision = await Decision.findById(id);

    if (!decision) {
        return res.status(404).json({ message: 'Decision not found.' });
    }
    if (decision.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized.' });
    }

    decision.alternatives.push({ name }); // Mongoose automatically assigns _id
    await decision.save();
    res.status(201).json(decision.alternatives[decision.alternatives.length - 1]); // Return the newly added alternative
});

// @desc    Update an alternative in a decision
// @route   PUT /api/decisions/:decisionId/alternatives/:alternativeId
// @access  Private
const updateAlternative = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const { decisionId, alternativeId } = req.params;

    if (!name) {
        return res.status(400).json({ message: 'Alternative name is required.' });
    }

    const decision = await Decision.findById(decisionId);

    if (!decision) {
        return res.status(404).json({ message: 'Decision not found.' });
    }
    if (decision.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized.' });
    }

    const alternative = decision.alternatives.id(alternativeId);
    if (!alternative) {
        return res.status(404).json({ message: 'Alternative not found.' });
    }

    alternative.name = name;
    await decision.save();
    res.json(alternative);
});

// @desc    Delete an alternative from a decision
// @route   DELETE /api/decisions/:decisionId/alternatives/:alternativeId
// @access  Private
const deleteAlternative = asyncHandler(async (req, res) => {
    const { decisionId, alternativeId } = req.params;

    const decision = await Decision.findById(decisionId);

    if (!decision) {
        return res.status(404).json({ message: 'Decision not found.' });
    }
    if (decision.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized.' });
    }

    const initialLength = decision.alternatives.length;
    decision.alternatives = decision.alternatives.filter(
        (alt) => alt._id.toString() !== alternativeId
    );

    if (decision.alternatives.length === initialLength) {
        return res.status(404).json({ message: 'Alternative not found.' });
    }

    // Also delete any associated ratings for this alternative
    await Rating.deleteMany({ decision: decisionId, alternative: alternativeId });

    await decision.save();
    res.json({ message: 'Alternative removed successfully.' });
});

// --- Criterion CRUD Operations (Basic Implementations) ---

// @desc    Add a criterion to a decision
// @route   POST /api/decisions/:id/criteria
// @access  Private
const addCriterion = asyncHandler(async (req, res) => {
    const { name, weight } = req.body;
    const { id } = req.params; // decisionId

    if (!name) {
        return res.status(400).json({ message: 'Criterion name is required.' });
    }

    const decision = await Decision.findById(id);

    if (!decision) {
        return res.status(404).json({ message: 'Decision not found.' });
    }
    if (decision.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized.' });
    }

    decision.criteria.push({ name, weight: weight || 1 }); // Mongoose automatically assigns _id
    await decision.save();
    res.status(201).json(decision.criteria[decision.criteria.length - 1]); // Return the newly added criterion
});

// @desc    Update a criterion in a decision
// @route   PUT /api/decisions/:decisionId/criteria/:criterionId
// @access  Private
const updateCriterion = asyncHandler(async (req, res) => {
    const { name, weight } = req.body;
    const { decisionId, criterionId } = req.params;

    if (!name) {
        return res.status(400).json({ message: 'Criterion name is required.' });
    }

    const decision = await Decision.findById(decisionId);

    if (!decision) {
        return res.status(404).json({ message: 'Decision not found.' });
    }
    if (decision.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized.' });
    }

    const criterion = decision.criteria.id(criterionId);
    if (!criterion) {
        return res.status(404).json({ message: 'Criterion not found.' });
    }

    criterion.name = name;
    criterion.weight = weight !== undefined ? weight : criterion.weight;
    await decision.save();
    res.json(criterion);
});

// @desc    Delete a criterion from a decision
// @route   DELETE /api/decisions/:decisionId/criteria/:criterionId
// @access  Private
const deleteCriterion = asyncHandler(async (req, res) => {
    const { decisionId, criterionId } = req.params;

    const decision = await Decision.findById(decisionId);

    if (!decision) {
        return res.status(404).json({ message: 'Decision not found.' });
    }
    if (decision.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized.' });
    }

    const initialLength = decision.criteria.length;
    decision.criteria = decision.criteria.filter(
        (crit) => crit._id.toString() !== criterionId
    );

    if (decision.criteria.length === initialLength) {
        return res.status(404).json({ message: 'Criterion not found.' });
    }

    // Also delete any associated ratings for this criterion
    await Rating.deleteMany({ decision: decisionId, criterion: criterionId });

    await decision.save();
    res.json({ message: 'Criterion removed successfully.' });
});


// --- Ratings Controllers ---

// @desc    Add or update multiple ratings for a decision
// @route   POST /api/decisions/:id/ratings
// @access  Private
const addRatings = asyncHandler(async (req, res) => {
    const { id } = req.params; // decisionId
    const { ratings } = req.body; // Array of { alternative, criterion, value }

    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authorized, user ID missing.' });
    }
    if (!Array.isArray(ratings) || ratings.length === 0) {
        return res.status(400).json({ message: 'No ratings provided.' });
    }

    const decision = await Decision.findById(id);

    if (!decision) {
        return res.status(404).json({ message: 'Decision not found.' });
    }
    if (decision.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to modify this decision.' });
    }

    const operations = ratings.map(r => ({
        updateOne: {
            filter: {
                decision: id,
                user: req.user.id,
                alternative: r.alternative,
                criterion: r.criterion
            },
            update: { $set: { value: r.value } },
            upsert: true // Insert if not found, update if found
        }
    }));

    try {
        const result = await Rating.bulkWrite(operations);
        res.status(200).json({ message: 'Ratings saved successfully', result });
    } catch (error) {
        console.error('Error saving ratings:', error);
        res.status(500).json({ message: 'Server error saving ratings', error: error.message });
    }
});

// @desc    Get all ratings for a specific decision by the authenticated user
// @route   GET /api/decisions/:id/ratings
// @access  Private
const getRatings = asyncHandler(async (req, res) => {
    const { id } = req.params; // decisionId

    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authorized, user ID missing.' });
    }

    const decision = await Decision.findById(id);

    if (!decision) {
        return res.status(404).json({ message: 'Decision not found.' });
    }
    if (decision.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view these ratings.' });
    }

    try {
        const ratings = await Rating.find({
            decision: id,
            user: req.user.id
        });
        res.status(200).json(ratings);
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ message: 'Server error fetching ratings', error: error.message });
    }
});


// @desc    Calculate scores for a decision's alternatives
// @route   POST /api/decisions/:id/calculate-scores
// @access  Private
const calculateScores = asyncHandler(async (req, res) => {
    const { id } = req.params; // decisionId

    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authorized, user ID missing.' });
    }

    const decision = await Decision.findById(id);

    if (!decision) {
        return res.status(404).json({ message: 'Decision not found.' });
    }

    if (decision.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to calculate scores for this decision.' });
    }

    const alternatives = decision.alternatives;
    const criteria = decision.criteria;

    // Check if there are enough alternatives and criteria
    if (alternatives.length === 0 || criteria.length === 0) {
        return res.status(400).json({ message: 'Please add alternatives and criteria to calculate outcome.' });
    }

    // Fetch all ratings for this decision by the current user
    const ratings = await Rating.find({
        decision: id,
        user: req.user.id
    });

    // If no ratings are found, return 0 scores but indicate success
    if (ratings.length === 0) {
        const zeroScores = alternatives.map(alt => ({
            _id: alt._id,
            name: alt.name,
            score: 0,
        }));
        // Update decision with 0 scores and save
        decision.alternatives = zeroScores.map(zs => {
            const originalAlt = alternatives.find(alt => alt._id.toString() === zs._id.toString());
            return { ...originalAlt.toObject(), score: zs.score };
        });
        decision.overallScore = 0;
        await decision.save();
        return res.status(200).json({
            decisionId: decision._id,
            title: decision.title,
            alternatives: zeroScores,
            overallScore: 0,
            message: "No ratings found. Scores are 0."
        });
    }


    // Calculate total weights for normalization
    const totalWeight = criteria.reduce((sum, crit) => sum + (crit.weight || 1), 0);
    // Handle case where totalWeight might be 0 (e.g., all criteria have 0 weight)
    const effectiveTotalWeight = totalWeight > 0 ? totalWeight : 1; // Avoid division by zero

    const alternativeScores = alternatives.map(alt => {
        let totalWeightedScore = 0;

        criteria.forEach(crit => {
            const rating = ratings.find(r =>
                r.alternative.toString() === alt._id.toString() &&
                r.criterion.toString() === crit._id.toString()
            );

            const weight = crit.weight || 1;

            if (rating) {
                totalWeightedScore += rating.value * weight;
            }
        });

        const normalizedScore = effectiveTotalWeight > 0 ? (totalWeightedScore / effectiveTotalWeight) : 0;

        return {
            alternative: alt.name,
            alternativeId: alt._id,
            score: parseFloat(normalizedScore.toFixed(2)), // Format to 2 decimal places
        };
    });

    // Sort alternatives by score in descending order
    alternativeScores.sort((a, b) => b.score - a.score);

    // Update alternative scores in the decision document
    decision.alternatives = decision.alternatives.map(alt => {
        const calculated = alternativeScores.find(s => s.alternativeId.toString() === alt._id.toString());
        if (calculated) {
            return { ...alt.toObject(), score: calculated.score };
        }
        return alt;
    });

    // Calculate and save an overall decision score (e.g., average of top alternatives or weighted average)
    // For simplicity, let's use the score of the top alternative if available, or 0.
    decision.overallScore = alternativeScores.length > 0 ? alternativeScores[0].score : 0;

    await decision.save(); // Save the updated decision with alternative scores

    res.status(200).json({
        decisionId: decision._id,
        title: decision.title,
        alternatives: decision.alternatives.map(alt => ({ // Return updated alternatives with their scores
            _id: alt._id,
            name: alt.name,
            score: alt.score
        })),
        overallScore: decision.overallScore
    });
});


module.exports = {
    getDecisions,
    createDecision,
    getDecisionById,
    updateDecision,
    deleteDecision,
    addAlternative,    // Exported
    updateAlternative, // Exported
    deleteAlternative, // Exported
    addCriterion,      // Exported
    updateCriterion,   // Exported
    deleteCriterion,   // Exported
    addRatings,        // Exported
    getRatings,        // Exported
    calculateScores
};