<?php
// UFC Live Data Configuration
// Update this file to change the displayed UFC data
// This file is loaded by index.php and can be easily updated

return [
    'current_event' => [
        'name' => 'UFC Fight Night: Nicolau vs Perez',
        'date' => date('F j, Y'),
        'main_event' => [
            'fighter_a' => 'Matheus Nicolau',
            'fighter_b' => 'Alex Perez',
            'weight_class' => 'Flyweight'
        ],
        'fight_card' => [
            ['fighter_a' => 'Matheus Nicolau', 'fighter_b' => 'Alex Perez', 'record_a' => '20-4-1', 'record_b' => '25-8-0'],
            ['fighter_a' => 'Brandon Moreno', 'fighter_b' => 'Brandon Royval', 'record_a' => '20-7-2', 'record_b' => '15-7-0'],
            ['fighter_a' => 'Manel Kape', 'fighter_b' => 'Daniel Marcos', 'record_a' => '19-7-0', 'record_b' => '10-1-0']
        ]
    ],
    'rankings' => [
        ['rank' => 'C', 'fighter' => 'Alexandre Pantoja', 'record' => '28-5-0', 'weight_class' => 'Flyweight'],
        ['rank' => '1', 'fighter' => 'Brandon Moreno', 'record' => '20-7-2', 'weight_class' => 'Flyweight'],
        ['rank' => '2', 'fighter' => 'Brandon Royval', 'record' => '15-7-0', 'weight_class' => 'Flyweight'],
        ['rank' => '3', 'fighter' => 'Matheus Nicolau', 'record' => '20-4-1', 'weight_class' => 'Flyweight'],
        ['rank' => '4', 'fighter' => 'Alex Perez', 'record' => '25-8-0', 'weight_class' => 'Flyweight']
    ],
    'news' => [
        ['title' => "Pantoja: 'I'm The Champion For A Reason'", 'date' => '1 hour ago'],
        ['title' => 'Moreno vs Royval Trilogy Announced', 'date' => '3 hours ago'],
        ['title' => 'UFC Fight Night Card Official', 'date' => '6 hours ago']
    ],
    'featured_fights' => [
        ['name' => 'UFC Fight Night: Nicolau vs Perez', 'fighters' => 'Nicolau vs Perez', 'status' => 'LIVE NOW', 'date' => date('F j, Y')],
        ['name' => 'UFC 300: Main Event', 'fighters' => 'Coming Soon', 'status' => 'UPCOMING', 'date' => 'April 2024'],
        ['name' => 'UFC 301: Title Fight', 'fighters' => 'Coming Soon', 'status' => 'UPCOMING', 'date' => 'May 2024'],
        ['name' => 'UFC 302: Championship', 'fighters' => 'Coming Soon', 'status' => 'SCHEDULED', 'date' => 'June 2024']
    ]
];
?>
