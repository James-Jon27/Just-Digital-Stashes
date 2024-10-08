from app.models import db, User, environment, SCHEMA
from sqlalchemy.sql import text


# Adds a demo user, you can add other users here if you want
def seed_users():
    demo = User(
        username='Demo', email='demo@aa.io', password='password', first_name="Demo", last_name="Lition")
    marnie = User(
        username='marnie', email='marnie@aa.io', password='password', first_name="Marnie", last_name="Smith")
    bobbie = User(
        username='bobbie', email='bobbie@aa.io', password='password', first_name="Bobbie", last_name="Lee")
    andrew = User(
        username='andrew', email='andrew@aa.io', password='password', first_name="Andrew", last_name="Santino")
    sukhpreet = User(
        username='sukhpreet', email='sukhpreet@aa.io', password='password', first_name="Sukhpreet", last_name="Sidhu")
    daniel = User(
        username='daniel', email='daniel@aa.io', password='password', first_name='Daniel', last_name='Ho')
    james = User(
        username='james', email='james@aa.io', password='password', first_name="James", last_name="Jones")
    
    lst = [demo ,marnie ,bobbie ,andrew ,sukhpreet ,daniel ,james]
    for user in lst:
        db.session.add(user)
    db.session.commit()


# Uses a raw SQL query to TRUNCATE or DELETE the users table. SQLAlchemy doesn't
# have a built in function to do this. With postgres in production TRUNCATE
# removes all the data from the table, and RESET IDENTITY resets the auto
# incrementing primary key, CASCADE deletes any dependent entities.  With
# sqlite3 in development you need to instead use DELETE to remove all data and
# it will reset the primary keys for you as well.
def undo_users():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))
        
    db.session.commit()
