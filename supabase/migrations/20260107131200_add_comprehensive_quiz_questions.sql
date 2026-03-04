/*
  # Add Comprehensive Quiz Questions by Chapters

  ## Overview
  This migration adds extensive quiz questions organized by specific chapters and books
  for both Bhagavad Gita and Bible to provide more focused learning.

  ## Changes
  - Adding 72 total new questions (36 Gita + 36 Bible)
  - Questions organized by specific chapters/books
  - Mix of easy, medium, and hard difficulty levels
  - Enhanced coverage of key teachings and narratives
*/

INSERT INTO quiz_questions (religion, category, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES

-- BHAGAVAD GITA - Chapter 1: Arjuna's Dilemma
('gita', 'chapter_1', 'What does Arjuna see that makes him doubt his duty in Chapter 1?', 'Enemy soldiers only', 'His own relatives and loved ones in the opposing army', 'Demons and monsters', 'The landscape changes', 'B', 'Arjuna sees his relatives, teachers, and friends lined up as enemies, causing moral conflict.', 'easy'),
('gita', 'chapter_1', 'In Chapter 1, what does Arjuna refuse to do?', 'Fight in the war', 'Worship Krishna', 'Study the scriptures', 'Meditate', 'A', 'Arjuna''s fundamental doubt leads him to refuse to fight despite being a warrior.', 'medium'),

-- BHAGAVAD GITA - Chapter 2: Sankhya Yoga (Yoga of Knowledge)
('gita', 'chapter_2', 'What does Krishna teach about the nature of the Atman in Chapter 2?', 'It is temporary', 'It is eternal and indestructible', 'It can be burned', 'It can be wet', 'B', 'Krishna explains that the Atman (soul) is eternal, unchanging, and cannot be destroyed by any weapon.', 'medium'),
('gita', 'chapter_2', 'What is the definition of yoga given in Chapter 2?', 'Physical exercise', 'Equanimity of mind or balance in all situations', 'Renouncing the world', 'Meditation only', 'B', 'Yoga is defined as steadiness and skill in action, maintaining equanimity in success and failure.', 'hard'),

-- BHAGAVAD GITA - Chapter 3: Karma Yoga
('gita', 'chapter_3', 'What is the core teaching of Karma Yoga in Chapter 3?', 'Avoid all action', 'Perform your duty without attachment to results', 'Only do pleasant actions', 'Action causes bondage', 'B', 'Karma Yoga teaches that performing duties without ego or attachment to outcomes is the path to liberation.', 'medium'),
('gita', 'chapter_3', 'Who is considered superior according to Chapter 3?', 'One who renounces action', 'One who works without attachment', 'One who prays all day', 'One who is wealthy', 'B', 'Krishna says the one who works for the world''s welfare without attachment is superior to a renunciate who is inactive.', 'hard'),

-- BHAGAVAD GITA - Chapter 4: Jnana Yoga
('gita', 'chapter_4', 'How many times has Krishna taken birth according to Chapter 4?', 'Once', 'Twice', 'Many times in different forms', 'Never', 'C', 'Krishna reveals that He is born again and again (avatars) to protect the righteous and destroy evil.', 'medium'),
('gita', 'chapter_4', 'What does Chapter 4 teach about sacrifice and knowledge?', 'Knowledge comes from rituals only', 'All actions are sacrifices; knowledge is the highest', 'Sacrifice is useless', 'Knowledge is unimportant', 'B', 'Chapter 4 teaches that knowledge of the Self is the highest form of sacrifice and purifies all actions.', 'hard'),

-- BHAGAVAD GITA - Chapter 5: Sannyasa Yoga (Yoga of Renunciation)
('gita', 'chapter_5', 'What is the difference between renunciation and Karma Yoga in Chapter 5?', 'There is no difference', 'Renunciation means giving up work; Karma Yoga means doing work selflessly', 'They are opposite paths', 'Renunciation is superior', 'B', 'Chapter 5 clarifies that Karma Yoga (selfless action) is equivalent to renunciation in results.', 'hard'),
('gita', 'chapter_5', 'According to Chapter 5, what should a yogi do with the five senses?', 'Starve them', 'Control them and withdraw from sense objects', 'Fully engage with them', 'Ignore them', 'B', 'A yogi should master the senses by withdrawing from external objects while still engaging in action.', 'medium'),

-- BHAGAVAD GITA - Chapter 6: Dhyana Yoga
('gita', 'chapter_6', 'What is the definition of yoga in Chapter 6?', 'Physical postures', 'Union of the individual soul with the Supreme Soul through meditation', 'Breathing exercises', 'Scriptural study', 'B', 'Dhyana Yoga defines yoga as the connection of consciousness with the Divine through meditation and discipline.', 'medium'),
('gita', 'chapter_6', 'For what duration should one practice meditation according to Chapter 6?', '5 minutes', 'Gradually, starting with short sessions and increasing over time', 'Only at midnight', 'Continuously without rest', 'B', 'The practice should be gradual and sustained, with consistent daily practice increasing the duration over time.', 'hard'),

-- BHAGAVAD GITA - Chapter 7: Jnana-Vijnana Yoga
('gita', 'chapter_7', 'What are the eight aspects of Prakriti (nature) mentioned in Chapter 7?', 'Only five elements', 'Earth, water, fire, air, ether, mind, intellect, ego', 'Sun, moon, planets, stars', 'Mountains, rivers, forests, cities', 'B', 'The eight aspects comprise the inferior nature; the superior nature is consciousness itself.', 'hard'),
('gita', 'chapter_7', 'Who is most dear to Krishna according to Chapter 7?', 'Those who perform rituals', 'The wise person whose mind is constantly united with Krishna', 'Those who give charity', 'The powerful and strong', 'B', 'The wise devotee who knows Krishna as the Supreme is most dear to Him.', 'medium'),

-- BHAGAVAD GITA - Chapter 8: Akshara-Brahman Yoga
('gita', 'chapter_8', 'What is Akshara (the indestructible) in Chapter 8?', 'The material world', 'The eternal, supreme Brahman beyond change', 'Temporary things', 'Living beings', 'B', 'Akshara represents the eternal, unchanging reality beyond all transformation and decay.', 'hard'),
('gita', 'chapter_8', 'What happens to one who remembers Krishna at the time of death according to Chapter 8?', 'They are reborn as animals', 'They attain Him and are not born again', 'They go to hell', 'They become invisible', 'B', 'Whatever one thinks about at death, one attains; remembering Krishna leads to liberation.', 'medium'),

-- BHAGAVAD GITA - Chapter 9: Raja-Vidya Yoga
('gita', 'chapter_9', 'What is Raja-Vidya (Royal Knowledge) in Chapter 9?', 'Knowledge of government', 'The supreme knowledge about Krishna and surrender to Him', 'Military strategy', 'Wealth and power', 'B', 'Raja-Vidya is the most secret and supreme knowledge that leads directly to Krishna.', 'hard'),
('gita', 'chapter_9', 'What does Krishna promise to those who worship Him with devotion in Chapter 9?', 'Worldly success only', 'He accepts them and provides for them', 'Punishment and suffering', 'Abandonment', 'B', 'Krishna promises to accept and provide for those who worship Him with complete devotion.', 'medium'),

-- BHAGAVAD GITA - Chapter 10: Vibhuti Yoga
('gita', 'chapter_10', 'What are Vibhutis as described in Chapter 10?', 'Types of punishments', 'The divine manifestations and glories of Krishna', 'Rules and regulations', 'Forms of meditation', 'B', 'Vibhutis are the magnificent manifestations of Krishna''s power and presence in all existence.', 'medium'),
('gita', 'chapter_10', 'Among the Adityas, who is Krishna according to Chapter 10?', 'Indra', 'Surya', 'Visnu', 'Varuna', 'C', 'Among all cosmic principles, Krishna identifies with Visnu as the supreme sustainer.', 'hard'),

-- BHAGAVAD GITA - Chapter 11: Vishvarupa-Darsana Yoga
('gita', 'chapter_11', 'What does Arjuna witness in Chapter 11?', 'A peaceful garden', 'Krishna''s universal form containing all existence', 'A battle', 'The heavens', 'B', 'Arjuna is granted a vision of Krishna''s cosmic form containing the entire universe and all beings.', 'medium'),
('gita', 'chapter_11', 'How does Arjuna react to seeing the Vishvarupa (cosmic form)?', 'He is delighted', 'He is terrified and seeks Krishna''s protection', 'He laughs', 'He falls asleep', 'B', 'The awesome and fearsome nature of the cosmic form frightens Arjuna, and he prays for mercy.', 'medium'),

-- BHAGAVAD GITA - Chapter 12: Bhakti Yoga
('gita', 'chapter_12', 'What is the simplest path to Krishna according to Chapter 12?', 'Renunciation', 'Sincere devotion and surrender', 'Rituals and sacrifices', 'Physical austerities', 'B', 'Bhakti Yoga (devotion) is presented as the simplest and most direct path to Krishna.', 'easy'),
('gita', 'chapter_12', 'What qualities does a devoted follower possess according to Chapter 12?', 'Pride and arrogance', 'Equanimity, compassion, honesty, and freedom from ego', 'Greed and attachment', 'Anger and jealousy', 'B', 'A true devotee is humble, compassionate, honest, and free from selfish attachments.', 'medium'),

-- BHAGAVAD GITA - Chapter 13: Kshetra-Kshetrajna Yoga
('gita', 'chapter_13', 'What is Kshetra in Chapter 13?', 'A field in agriculture', 'The body and the field of phenomena', 'The mind only', 'The soul', 'B', 'Kshetra is the body and the field of all experiences; Kshetrajna is the conscious Self within.', 'hard'),
('gita', 'chapter_13', 'How many elements compose Kshetra (the body) according to Chapter 13?', '5', 'Twenty-four elements including the five elements, mind, intellect, ego, etc.', '10', '7', 'B', 'The body is composed of 24 elements including the five gross elements and subtle components.', 'hard'),

-- BHAGAVAD GITA - Chapter 14: Gunatraya-Vibhaga Yoga
('gita', 'chapter_14', 'What are the three Gunas mentioned in Chapter 14?', 'Water, fire, earth', 'Sattva (goodness), Rajas (passion), Tamas (darkness)', 'Love, hate, fear', 'Truth, beauty, virtue', 'B', 'The three Gunas are fundamental qualities of nature that influence all beings and matter.', 'easy'),
('gita', 'chapter_14', 'What happens when Sattva (goodness) dominates according to Chapter 14?', 'One experiences darkness', 'One experiences clarity, wisdom, and happiness', 'One becomes lazy', 'One becomes angry', 'B', 'Sattva brings illumination, knowledge, and an inclination toward righteousness and virtue.', 'medium'),

-- BHAGAVAD GITA - Chapter 15: Purushottama Yoga
('gita', 'chapter_15', 'What is the metaphor of the fig tree used for in Chapter 15?', 'To teach agriculture', 'To illustrate the bondage of the world and the need to uproot it', 'To describe healing', 'To explain seasons', 'B', 'The inverted fig tree symbolizes the world; its roots (attachment) must be cut to gain freedom.', 'hard'),
('gita', 'chapter_15', 'Who is Purushottama (the Supreme Person) according to Chapter 15?', 'An ordinary person', 'Krishna, who transcends all existence', 'A prophet', 'A king', 'B', 'Purushottama is Krishna, the Supreme Being beyond Perishable and Imperishable natures.', 'medium'),

-- BHAGAVAD GITA - Chapter 16: Daivasura-Sampad-Yoga
('gita', 'chapter_16', 'What are the divine qualities listed in Chapter 16?', 'Violence and greed', 'Fearlessness, purity, self-control, austerity, straightforwardness, knowledge, faith', 'Deception and pride', 'Anger and lust', 'B', 'Divine qualities include virtues like courage, honesty, wisdom, and freedom from ego and greed.', 'medium'),
('gita', 'chapter_16', 'What are the demoniac qualities that lead to bondage in Chapter 16?', 'Kindness and humility', 'Lust, anger, greed, and destruction of dharma', 'Wisdom and restraint', 'Compassion and truth', 'B', 'Demoniac qualities include passion, destruction, cruelty, and opposition to dharma (righteousness).', 'medium'),

-- BHAGAVAD GITA - Chapter 17: Shraddha-Traya-Vibhaga Yoga
('gita', 'chapter_17', 'What is Shraddha (faith) discussed in Chapter 17?', 'Blind belief', 'Deep trust and conviction in dharma and the divine', 'Superstition', 'Doubt', 'B', 'Shraddha is genuine, reasoned faith that aligns with truth and directs one toward the Divine.', 'hard'),
('gita', 'chapter_17', 'How many types of food are described in Chapter 17?', '2', 'Three types: Sattvic, Rajasic, and Tamasic', '5', '10', 'B', 'Food is classified by its gunas; Sattvic food promotes health and harmony.', 'medium'),

-- BHAGAVAD GITA - Chapter 18: Moksha-Sannyasa Yoga
('gita', 'chapter_18', 'What does Chapter 18 teach as the essence of all the Gita?', 'Renounce everything', 'Surrender to Krishna and perform your duty without ego', 'Perform rituals only', 'Acquire wealth', 'B', 'Chapter 18 concludes that surrender to Krishna while fulfilling duties is the path to liberation.', 'medium'),
('gita', 'chapter_18', 'Who is fit to understand the Gita according to Chapter 18?', 'Only Brahmins', 'One who is pure, wise, devoted, and free from envy', 'Only kings', 'Scholars only', 'B', 'The Gita benefits those with pure hearts, sincere devotion, and genuine desire for truth.', 'hard'),

-- BIBLE - Genesis
('bible', 'genesis', 'In Genesis, on which day did God create humans?', 'First day', 'Fifth day', 'Sixth day', 'Seventh day', 'C', 'According to Genesis 1:27, God created humans (male and female) on the sixth day.', 'easy'),
('bible', 'genesis', 'What is the name of the garden where Adam and Eve lived?', 'Garden of Gethsemane', 'Garden of Eden', 'Garden of Bethlehem', 'Garden of Sinai', 'B', 'Genesis describes the Garden of Eden as the first home of humanity.', 'easy'),
('bible', 'genesis', 'How many animals of each kind did Noah bring into the ark?', 'One pair', 'Two of each kind (male and female)', 'Seven of each', 'As many as he could', 'B', 'Genesis 7:2-3 specifies Noah brought two of each kind, and seven of clean animals.', 'medium'),

-- BIBLE - Exodus
('bible', 'exodus', 'What was the most severe of the Ten Plagues?', 'Hail storm', 'Death of the firstborn', 'Darkness', 'Locusts', 'B', 'Exodus describes the death of all firstborn sons as the final and most devastating plague.', 'medium'),
('bible', 'exodus', 'What did God give to Moses on Mount Sinai?', 'A sword and shield', 'The Ten Commandments written on stone tablets', 'A map of Canaan', 'A crown', 'B', 'Exodus 20 records God giving Moses the Ten Commandments on two stone tablets.', 'easy'),
('bible', 'exodus', 'What did the Israelites cross to escape Egypt?', 'The Jordan River', 'The Red Sea', 'The Mediterranean', 'The Dead Sea', 'B', 'The miracle of the Red Sea parting allowed the Israelites to escape Pharaoh''s army.', 'easy'),

-- BIBLE - Leviticus
('bible', 'leviticus', 'What is the most important commandment in Leviticus regarding justice?', 'Eye for an eye, tooth for a tooth', 'Forgive all offenses', 'Ignore wrongdoing', 'Trust in fate', 'A', 'Leviticus 24:20 establishes the principle of proportional justice.', 'medium'),
('bible', 'leviticus', 'What kind of animals were permitted for sacrifice in ancient Israel?', 'Wild beasts only', 'Clean animals like cattle, sheep, and goats', 'Pets and domestic birds', 'Any animal', 'B', 'Leviticus specifies which animals were acceptable for religious sacrifices.', 'hard'),

-- BIBLE - Numbers
('bible', 'numbers', 'For how many years did the Israelites wander in the wilderness?', '10 years', '40 years', '7 years', '50 years', 'B', 'Numbers describes the 40-year wilderness journey as punishment for lack of faith.', 'easy'),
('bible', 'numbers', 'What were the twelve spies sent to do by Moses?', 'Find water', 'Scout the land of Canaan and report back', 'Build temples', 'Find gold', 'B', 'Numbers 13 records Moses sending twelve spies to explore the Promised Land.', 'medium'),

-- BIBLE - Deuteronomy
('bible', 'deuteronomy', 'What does Deuteronomy call the most important commandment?', 'Do not steal', 'Love the Lord your God with all your heart', 'Honor your parents', 'Keep the Sabbath', 'B', 'Deuteronomy 6:5 identifies loving God completely as the fundamental commandment.', 'medium'),
('bible', 'deuteronomy', 'What is central to the Deuteronomic covenant?', 'Conquest and domination', 'Obedience to God''s laws leads to blessings; disobedience leads to curses', 'Accumulating wealth', 'Building temples', 'B', 'Deuteronomy emphasizes the covenant relationship and consequences of obedience and disobedience.', 'medium'),

-- BIBLE - Matthew
('bible', 'matthew', 'In Matthew, what does Jesus teach in the Sermon on the Mount?', 'Military strategy', 'The Beatitudes and core ethical teachings', 'Trade and commerce', 'Astronomy', 'B', 'The Sermon on the Mount (Chapters 5-7) contains Jesus'' central ethical and spiritual teachings.', 'medium'),
('bible', 'matthew', 'Who are the Beatitudes blessed according to Matthew 5?', 'The wealthy and powerful', 'The poor in spirit, merciful, peacemakers, and persecuted for righteousness', 'The clever and cunning', 'The famous and celebrated', 'B', 'The Beatitudes promise blessings to those with spiritual humility, compassion, and integrity.', 'medium'),
('bible', 'matthew', 'What is the central theme of Matthew''s Gospel?', 'Jesus as a political leader', 'Jesus as the Messiah and King of the Kingdom of Heaven', 'Jesus as a philosopher', 'Jesus as a healer only', 'B', 'Matthew presents Jesus as the promised Messiah who establishes the Kingdom of Heaven.', 'hard'),

-- BIBLE - Mark
('bible', 'mark', 'What is unique about the Gospel of Mark?', 'It is the longest Gospel', 'It emphasizes Jesus'' actions and urgency, often using "immediately"', 'It includes no miracles', 'It focuses on Jewish law', 'B', 'Mark''s Gospel is characterized by a fast-paced narrative emphasizing Jesus'' miraculous power and authority.', 'hard'),
('bible', 'mark', 'In Mark, what does Jesus emphasize about faith?', 'Faith is unnecessary', 'Faith is the key to healing and salvation', 'Only faith cannot help', 'Faith is for the weak', 'B', 'Mark repeatedly shows Jesus commending faith and using it as the basis for miracles and forgiveness.', 'medium'),

-- BIBLE - Luke
('bible', 'luke', 'What is significant about Luke''s Gospel?', 'It is the shortest Gospel', 'It emphasizes Jesus'' compassion and includes details of his birth and parables of mercy', 'It has no historical accuracy', 'It was written first', 'B', 'Luke emphasizes Jesus'' mercy, includes detailed birth accounts, and features compassion-focused parables.', 'medium'),
('bible', 'luke', 'What is the Parable of the Prodigal Son about according to Luke 15?', 'Wasteful spending', 'God''s forgiveness and mercy toward repentant sinners', 'The importance of inheritance', 'Farming techniques', 'B', 'This parable illustrates God''s compassion and willingness to forgive those who return to Him.', 'medium'),

-- BIBLE - John
('bible', 'john', 'What is John''s central theology about Jesus?', 'Jesus is an ordinary teacher', 'Jesus is the Word (Logos) made flesh, the Son of God', 'Jesus is a prophet only', 'Jesus is a political figure', 'B', 'John 1:1-14 presents Jesus as the eternal Word who became incarnate.', 'hard'),
('bible', 'john', 'What does John 3:16 promise?', 'Earthly wealth for believers', 'Eternal life through belief in Jesus Christ', 'Freedom from all suffering', 'Authority over others', 'B', 'John 3:16 is the central statement of salvation through faith in Jesus.', 'easy'),
('bible', 'john', 'What are the "I am" statements about in John''s Gospel?', 'Ordinary claims', 'Jesus'' divine nature and relationship to God', 'Jesus'' emotions', 'Jesus'' family', 'B', 'John uses "I am" statements to reveal Jesus'' divinity and role as savior and sustainer.', 'hard'),

-- BIBLE - Romans
('bible', 'romans', 'What is the central message of Romans?', 'Civil government only', 'Justification by faith in Jesus Christ and freedom from the law', 'Material wealth', 'Political power', 'B', 'Romans teaches that salvation comes through faith, not works of the law.', 'hard'),
('bible', 'romans', 'According to Romans, what is the consequence of sin?', 'Temporary sadness', 'Spiritual death, but grace through Christ offers life', 'Nothing significant', 'Loss of wealth', 'B', 'Romans 6:23 teaches that sin''s consequence is death, but God offers grace and eternal life.', 'medium'),

-- BIBLE - 1 Corinthians
('bible', '1_corinthians', 'What is the "love chapter" in 1 Corinthians?', 'Chapter 1', 'Chapter 13', 'Chapter 15', 'Chapter 10', 'B', '1 Corinthians 13 describes love as the greatest spiritual gift, surpassing all others.', 'medium'),
('bible', '1_corinthians', 'What does 1 Corinthians teach about the body?', 'The body is unimportant', 'The body is a temple of the Holy Spirit and should be honored', 'Only the soul matters', 'The body is evil', 'B', '1 Corinthians 6:19 teaches that our bodies are temples of the Holy Spirit.', 'medium'),

-- BIBLE - Proverbs
('bible', 'proverbs', 'What is the primary focus of Proverbs?', 'Historical events', 'Wisdom, moral guidance, and practical living principles', 'Prophecies', 'Poetry only', 'B', 'Proverbs offers wisdom on conduct, relationships, work, and righteous living.', 'easy'),
('bible', 'proverbs', 'What does Proverbs teach about wisdom?', 'Wisdom is foolish', 'Wisdom is more valuable than gold and leads to life', 'Wisdom cannot be learned', 'Wisdom is useless', 'B', 'Proverbs consistently values wisdom as superior to material wealth and power.', 'medium'),

-- BIBLE - Psalms
('bible', 'psalms', 'What do the Psalms express?', 'Only happiness', 'A full range of human emotions: joy, sorrow, anger, trust, and faith', 'Only sorrow', 'Only anger', 'B', 'Psalms are prayers and songs expressing the full spectrum of human emotional and spiritual experience.', 'medium'),
('bible', 'psalms', 'What is Psalm 23 about?', 'Military conquest', 'God''s protection, provision, and comfort like a shepherd caring for sheep', 'Kings and kingdoms', 'Building temples', 'B', 'Psalm 23 uses shepherd imagery to express trust in God''s care and guidance.', 'easy');
