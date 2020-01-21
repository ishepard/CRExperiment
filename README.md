# CRExperiment
This tool can be used to do online (controlled) experiments on code reviews. CRExperiment has been previously used in these studies:

1. Spadini, Davide, et al. "Test-driven code review: an empirical study." *2019 IEEE/ACM 41st International Conference on Software Engineering (ICSE). IEEE, 2019.*
2. Spadini, Davide, et al. "Primers or Reminders? The Effects of Existing Review Comments on Code Review" *42nd International Conference on Software Engineering (ICSE '20), May 23--29, 2020, Seoul, Republic of Korea*


## INSTALL
If you like to run the tool, you can do it with very simple steps.
First, clone the repo:

```
> git clone https://github.com/ishepard/CRExperiment.git
> cd CRExperiment
```

### (OPTIONAL)

It is suggested to make use of `virtualenv`:

```
> virtualenv -p python3 venv
> source venv/bin/activate
```

### INSTALL THE REQUIREMENTS

Install the requirements:

```
> pip install -r requirements.txt
```

## RUN
CRExperiment uses Flask to create a webserver. Fore more information about Flask, [check the documentation](http://flask.palletsprojects.com/en/1.1.x/).

In your terminal, type:

```
> export FLASK_APP=run.py
> flask run
```
On your browser, you can now visit the page [http://127.0.0.1:5000/](http://127.0.0.1:5000/) to see the experiment landing page. 

## EXTEND OR MODIFY
Every experiment is different, so you will probably need to modify CRExperiment to 